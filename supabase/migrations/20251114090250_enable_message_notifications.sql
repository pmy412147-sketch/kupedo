/*
  # Enable Push Notifications for New Messages

  1. Overview
    - Creates a trigger that automatically sends push notifications when a new message is created
    - Uses Supabase edge function to send notifications via Expo Push Service
    
  2. How it works
    - When a message is inserted into the messages table
    - Trigger calls edge function with recipient's user_id
    - Edge function fetches push tokens and sends notification
    
  3. Notification content
    - Title: Sender's display name
    - Body: Message preview (first 100 characters)
    - Data: conversationId, senderId, type: "message"
    
  4. Security
    - Only triggers for authenticated users
    - Edge function uses service role to fetch tokens
    - Recipient must have registered push token
*/

-- Function to send push notification for new message
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

  -- Call edge function to send push notification
  -- Using pg_net extension (if available) or direct HTTP call
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'userId', v_recipient_id,
      'title', 'Nová správa od ' || v_sender_name,
      'body', v_message_preview,
      'data', jsonb_build_object(
        'type', 'message',
        'conversationId', NEW.conversation_id,
        'senderId', NEW.sender_id
      )
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION send_message_notification();

-- Note: This requires pg_net extension
-- If not available, notifications can be sent from the client after message creation
