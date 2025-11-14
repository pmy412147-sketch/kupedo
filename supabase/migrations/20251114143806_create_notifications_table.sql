/*
  # Create Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text) - Type of notification: message, favorite, ad_view, ad_expired, system
      - `title` (text) - Short title of notification
      - `message` (text) - Full notification message
      - `read` (boolean) - Whether notification has been read
      - `link` (text, optional) - Optional link to related resource
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for users to read their own notifications
    - Add policy for users to update their own notifications (mark as read)
    - Add policy for system to insert notifications

  3. Indexes
    - Index on `user_id` and `read` for efficient queries
    - Index on `created_at` for sorting

  4. Triggers
    - Create trigger to send notification when user receives a new message
    - Create trigger to send notification when someone favorites user's ad
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('message', 'favorite', 'ad_view', 'ad_expired', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  link text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications(user_id, read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON notifications(created_at DESC);

-- Function to create notification for new message
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if message is not read
  IF NOT NEW.read THEN
    INSERT INTO notifications (user_id, type, title, message, link)
    SELECT
      NEW.receiver_id,
      'message',
      'Nová správa',
      'Máte novú správu od používateľa',
      '/spravy'
    WHERE NOT EXISTS (
      -- Don't create duplicate notifications for same conversation
      SELECT 1 FROM notifications
      WHERE user_id = NEW.receiver_id
      AND type = 'message'
      AND read = false
      AND created_at > NOW() - INTERVAL '5 minutes'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for message notifications
DROP TRIGGER IF EXISTS trigger_message_notification ON messages;
CREATE TRIGGER trigger_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

-- Function to create notification when someone favorites an ad
CREATE OR REPLACE FUNCTION create_favorite_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT
    ads.user_id,
    'favorite',
    'Nový záujemca',
    'Niekto si obľúbil váš inzerát',
    '/inzerat/' || NEW.ad_id
  FROM ads
  WHERE ads.id = NEW.ad_id
  AND ads.user_id != NEW.user_id; -- Don't notify if user favorites their own ad

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for favorite notifications
DROP TRIGGER IF EXISTS trigger_favorite_notification ON favorites;
CREATE TRIGGER trigger_favorite_notification
  AFTER INSERT ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION create_favorite_notification();
