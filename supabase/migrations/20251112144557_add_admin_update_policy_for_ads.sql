/*
  # Add Admin Update Policy for Ads

  1. Changes
    - Add UPDATE policy for admins to modify any ad
  
  2. Security
    - Only users in admin_users table can update any ad
    - Regular users can still only update their own ads
*/

-- Allow admins to update any ad
CREATE POLICY "Admins can update any ad"
  ON ads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );
