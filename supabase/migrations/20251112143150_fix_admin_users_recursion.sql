/*
  # Fix Admin Users RLS Recursion Issue

  1. Problem
    - The policy "Admins can view all admin users" creates infinite recursion
    - When checking if user is admin, it needs to query admin_users, which requires checking if user is admin...
  
  2. Solution
    - Keep only the simple "Users can view own admin status" policy for SELECT
    - Remove recursive policies that cause 500 errors
  
  3. Security
    - Users can only see their own admin record
    - Super admins can manage admin records (insert/update/delete)
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;

-- Keep the working policies:
-- 1. "Users can view own admin status" - allows users to see their own record (already exists)
-- 2. "Super admins can manage admin users" - allows super admins to manage (already exists)
-- 3. "Super admins can manage admins" - duplicate, can be removed

DROP POLICY IF EXISTS "Super admins can manage admins" ON admin_users;
