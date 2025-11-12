/*
  # Recreate admin_adjust_user_coins function

  1. Problem
    - Function exists but gets 404 error (schema cache issue)
    - Likely related to function dependencies
  
  2. Solution
    - Drop and recreate function with inline admin check
    - Remove dependency on check_user_is_admin function
  
  3. Security
    - Verify admin status directly in the function
*/

-- Drop existing function
DROP FUNCTION IF EXISTS admin_adjust_user_coins(uuid, uuid, integer, text);

-- Recreate with inline admin check
CREATE OR REPLACE FUNCTION admin_adjust_user_coins(
  p_admin_id uuid,
  p_user_id uuid,
  p_amount integer,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean;
  v_current_balance integer;
  v_new_balance integer;
BEGIN
  -- Check if caller is admin (inline check)
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = p_admin_id
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM user_coins
  WHERE user_id = p_user_id;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Prevent negative balance
  IF v_new_balance < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Update balance
  UPDATE user_coins
  SET balance = v_new_balance,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO coin_transactions (user_id, amount, transaction_type, description, metadata)
  VALUES (
    p_user_id,
    p_amount,
    'admin_adjustment',
    p_reason,
    jsonb_build_object('admin_id', p_admin_id)
  );

  RETURN jsonb_build_object(
    'success', true,
    'old_balance', v_current_balance,
    'new_balance', v_new_balance
  );
END;
$$;
