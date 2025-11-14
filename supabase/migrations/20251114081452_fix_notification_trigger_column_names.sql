/*
  # Fix Notification Trigger Column Names

  1. Changes
    - Update send_message_notification function to use correct column names
    - Change user1_id/user2_id to participant_1/participant_2
    
  2. Security
    - Function remains SECURITY DEFINER for edge function calls
*/

CREATE OR REPLACE FUNCTION send_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  sender_name text;
  recipient_id uuid;
  conversation_ad_id uuid;
BEGIN
  SELECT display_name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  SELECT 
    CASE 
      WHEN participant_1 = NEW.sender_id THEN participant_2
      ELSE participant_1
    END,
    ad_id
  INTO recipient_id, conversation_ad_id
  FROM conversations
  WHERE id = NEW.conversation_id;

  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
    ),
    body := jsonb_build_object(
      'userId', recipient_id,
      'title', 'Nová správa od ' || COALESCE(sender_name, 'používateľa'),
      'body', CASE 
        WHEN length(NEW.content) > 100 THEN substring(NEW.content, 1, 100) || '...'
        ELSE NEW.content
      END,
      'data', jsonb_build_object(
        'type', 'message',
        'conversationId', NEW.conversation_id,
        'senderId', NEW.sender_id,
        'adId', conversation_ad_id
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
