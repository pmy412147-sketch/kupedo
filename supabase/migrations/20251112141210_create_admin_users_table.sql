/*
  # Admin Users Table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `role` (text) - admin role: 'super_admin', 'admin', 'moderator'
      - `permissions` (jsonb) - specific permissions
      - `created_at` (timestamptz)
      - `created_by` (uuid) - who granted admin access
  
  2. Security
    - Enable RLS on admin_users table
    - Only super admins can manage admin users
    - Admins can view other admins
  
  3. Initial Data
    - Creates helper function to make first user admin (for setup)
*/

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.role = 'super_admin'
    )
  );

-- Function to make a user admin (for initial setup)
CREATE OR REPLACE FUNCTION make_user_admin(
  p_email text,
  p_role text DEFAULT 'super_admin'
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_exists boolean;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Check if already admin
  SELECT EXISTS(
    SELECT 1 FROM admin_users WHERE user_id = v_user_id
  ) INTO v_exists;
  
  IF v_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is already an admin');
  END IF;
  
  -- Make user admin
  INSERT INTO admin_users (user_id, role)
  VALUES (v_user_id, p_role);
  
  RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin (with role)
CREATE OR REPLACE FUNCTION get_user_admin_role(p_user_id uuid)
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role
  FROM admin_users
  WHERE user_id = p_user_id;
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
