/*
  # Completely Redesign Admin RLS Policies

  1. Problem
    - Any policy that checks admin_users table creates infinite recursion
    - We need a non-recursive way to manage admin access
  
  2. Solution
    - Use ONLY simple user_id = auth.uid() check for SELECT
    - For INSERT/UPDATE/DELETE, we'll handle permissions in application code
    - Or use a bypass for service_role
  
  3. Security
    - Users can view their own admin status (no recursion)
    - All other operations allowed only via service_role or application logic
*/

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own admin status" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

-- Create simple non-recursive policies

-- Allow users to view ONLY their own admin status
CREATE POLICY "Users can view own admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow service_role to do everything (for admin operations via Edge Functions or backend)
CREATE POLICY "Service role can manage all"
  ON admin_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
