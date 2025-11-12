/*
  # Recreate admin ban/unban functions

  1. Problem
    - Functions may have schema cache issues like coins function
  
  2. Solution
    - Drop and recreate with inline admin checks
  
  3. Security
    - Verify admin status directly in functions
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS admin_ban_user(uuid, uuid, text, timestamptz);
DROP FUNCTION IF EXISTS admin_unban_user(uuid, uuid);

-- Create admin_ban_user function
CREATE OR REPLACE FUNCTION admin_ban_user(
  p_admin_id uuid,
  p_user_id uuid,
  p_reason text,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Check if caller is admin
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = p_admin_id
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Deactivate any existing bans
  UPDATE user_bans
  SET is_active = false,
      updated_at = now()
  WHERE user_id = p_user_id AND is_active = true;

  -- Create new ban
  INSERT INTO user_bans (user_id, banned_by, reason, expires_at, is_active)
  VALUES (p_user_id, p_admin_id, p_reason, p_expires_at, true);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Create admin_unban_user function
CREATE OR REPLACE FUNCTION admin_unban_user(
  p_admin_id uuid,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Check if caller is admin
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = p_admin_id
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Deactivate all active bans
  UPDATE user_bans
  SET is_active = false,
      updated_at = now()
  WHERE user_id = p_user_id AND is_active = true;

  RETURN jsonb_build_object('success', true);
END;
$$;
