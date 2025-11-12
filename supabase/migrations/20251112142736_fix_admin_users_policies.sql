/*
  # Fix Admin Users RLS Policies

  1. Changes
    - Add policy allowing users to view their own admin status
    - Simplify existing policies to avoid conflicts
  
  2. Security
    - Users can only see their own admin record
    - Admins can see all admin records
    - Only super admins can modify admin records
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view other admins" ON admin_users;

-- Allow users to view their own admin status (CRITICAL for AuthContext)
CREATE POLICY "Users can view own admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to view all admin users
CREATE POLICY "Admins can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );
