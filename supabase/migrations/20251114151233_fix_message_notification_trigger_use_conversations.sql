/*
  # Fix Message Notification Trigger

  1. Changes
    - Update trigger to use conversations table to determine receiver
    - Message table has conversation_id, not receiver_id
    - Conversations table has participant_1 and participant_2
*/

-- Drop old trigger
DROP TRIGGER IF EXISTS trigger_message_notification ON messages;

-- Recreate function with correct logic
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  receiver_user_id uuid;
  ad_owner_id uuid;
BEGIN
  -- Get conversation participants
  SELECT 
    CASE 
      WHEN participant_1 = NEW.sender_id THEN participant_2
      ELSE participant_1
    END INTO receiver_user_id
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Only create notification if message is not read and we found a receiver
  IF NOT NEW.is_read AND receiver_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    SELECT
      receiver_user_id,
      'message',
      'Nová správa',
      'Máte novú správu',
      '/spravy'
    WHERE NOT EXISTS (
      -- Don't create duplicate notifications for same conversation
      SELECT 1 FROM notifications
      WHERE user_id = receiver_user_id
      AND type = 'message'
      AND read = false
      AND created_at > NOW() - INTERVAL '5 minutes'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER trigger_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();