/*
  # Add Admin Delete Policy for Ads

  1. Problem
    - Admins cannot delete ads because DELETE policy only allows users to delete their own ads
    - Admin tried to delete ad but nothing happened
  
  2. Solution
    - Add DELETE policy for admins that checks admin_users table
  
  3. Security
    - Only users with admin_role in admin_users table can delete any ad
*/

-- Allow admins to delete any ad
CREATE POLICY "Admins can delete any ad"
  ON ads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );
