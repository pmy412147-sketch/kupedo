/*
  # Disable Notification Trigger Temporarily

  1. Changes
    - Drop the notification trigger
    - Drop the notification function
    
  2. Reason
    - The net schema doesn't exist in the current setup
    - Push notifications don't work in Expo Go anyway
    - This prevents errors when sending messages
    
  3. Note
    - Can be re-enabled when using development build
    - The messages functionality will work without notifications
*/

DROP TRIGGER IF EXISTS on_message_created ON messages;
DROP FUNCTION IF EXISTS send_message_notification();
