/*
  # Fix Message Notification Trigger - Column Names

  1. Problem
    - Trigger function uses wrong column names
    - Looks for user1_id and user2_id
    - But conversations table has participant_1 and participant_2
    
  2. Fix
    - Update function to use correct column names
    - Test that trigger works correctly
    
  3. Testing
    - After migration, send a message
    - Check notification_queue table
    - Should see new notification entry
*/

-- Fix trigger function with correct column names
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
      WHEN c.participant_1 = NEW.sender_id THEN c.participant_2
      ELSE c.participant_1
    END INTO v_recipient_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- If no recipient found, skip notification
  IF v_recipient_id IS NULL THEN
    RAISE WARNING 'No recipient found for conversation %', NEW.conversation_id;
    RETURN NEW;
  END IF;

  -- Get sender's display name
  SELECT COALESCE(display_name, 'Používateľ') INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- If no sender name found, use default
  IF v_sender_name IS NULL THEN
    v_sender_name := 'Používateľ';
  END IF;

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

  RAISE NOTICE 'Notification queued for user % from %', v_recipient_id, v_sender_name;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to queue push notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is active
DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION send_message_notification();
