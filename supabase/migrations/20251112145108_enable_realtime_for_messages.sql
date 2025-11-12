/*
  # Enable Realtime for Messages

  1. Problem
    - New messages don't appear immediately after sending
    - User needs to refresh page to see new messages
    - Realtime subscription exists in code but may not be enabled in DB
  
  2. Solution
    - Enable realtime publication for messages table
    - This allows postgres_changes events to be broadcast
  
  3. Security
    - RLS policies still apply to realtime subscriptions
*/

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
