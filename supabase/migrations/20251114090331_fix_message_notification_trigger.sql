/*
  # Fix Message Notification Trigger

  1. Changes
    - Simplifies notification trigger
    - Stores notification requests in a queue table
    - Client or scheduled job can process the queue
    
  2. Alternative Approach
    - Instead of calling edge function directly from trigger (which requires pg_net config)
    - We store notification requests in a table
    - Edge function or client can poll and process them
    
  3. Tables
    - notification_queue: Stores pending notifications
    
  4. Security
    - RLS enabled
    - Only service role can read queue
*/

-- Create notification queue table
CREATE TABLE IF NOT EXISTS notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access notification queue
CREATE POLICY "Service role can manage notification queue"
  ON notification_queue
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notification_queue_processed 
  ON notification_queue(processed, created_at) 
  WHERE NOT processed;

-- Simplified trigger function that adds to queue
CREATE OR REPLACE FUNCTION send_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_name text;
  v_message_preview text;
  v_recipient_id uuid;
BEGIN
  -- Get the recipient (the user who is NOT the sender in this conversation)
  SELECT 
    CASE 
      WHEN c.user1_id = NEW.sender_id THEN c.user2_id
      ELSE c.user1_id
    END INTO v_recipient_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- If no recipient found, skip notification
  IF v_recipient_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get sender's display name
  SELECT COALESCE(display_name, 'Používateľ') INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Create message preview (max 100 chars)
  v_message_preview := LEFT(NEW.content, 100);
  IF LENGTH(NEW.content) > 100 THEN
    v_message_preview := v_message_preview || '...';
  END IF;

  -- Add notification to queue
  INSERT INTO notification_queue (recipient_id, title, body, data)
  VALUES (
    v_recipient_id,
    'Nová správa od ' || v_sender_name,
    v_message_preview,
    jsonb_build_object(
      'type', 'message',
      'conversationId', NEW.conversation_id,
      'senderId', NEW.sender_id
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to queue push notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION send_message_notification();
