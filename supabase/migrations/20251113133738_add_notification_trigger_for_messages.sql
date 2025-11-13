/*
  # Notification Trigger for New Messages

  1. Functions
    - `send_message_notification` - Trigger function that calls edge function
    
  2. Triggers
    - Automatically send notification when new message is inserted

  This trigger will call the edge function to send push notifications
  when a new message is created.
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
      WHEN user1_id = NEW.sender_id THEN user2_id
      ELSE user1_id
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

CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION send_message_notification();
