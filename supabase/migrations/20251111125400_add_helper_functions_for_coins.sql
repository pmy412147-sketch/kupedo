/*
  # Helper Functions for Coins Management

  1. New Functions
    - `add_user_coins` - Safely add coins to user balance
    - `check_user_is_admin` - Check if user has admin privileges
    - `get_boost_statistics` - Get boost statistics for admin dashboard

  2. Security
    - Functions use SECURITY DEFINER for elevated privileges
    - Input validation to prevent misuse
*/

-- Function to safely add coins to user balance
CREATE OR REPLACE FUNCTION add_user_coins(
  p_user_id uuid,
  p_amount integer
)
RETURNS void AS $$
DECLARE
  user_coins_exists boolean;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Check if user_coins record exists
  SELECT EXISTS(SELECT 1 FROM user_coins WHERE user_id = p_user_id) INTO user_coins_exists;
  
  -- Create user_coins if it doesn't exist
  IF NOT user_coins_exists THEN
    INSERT INTO user_coins (user_id, balance)
    VALUES (p_user_id, 0);
  END IF;
  
  -- Add coins to user balance
  UPDATE user_coins
  SET balance = balance + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION check_user_is_admin(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to adjust user coins (admin only)
CREATE OR REPLACE FUNCTION admin_adjust_user_coins(
  p_admin_id uuid,
  p_user_id uuid,
  p_amount integer,
  p_reason text
)
RETURNS jsonb AS $$
DECLARE
  v_is_admin boolean;
  v_current_balance integer;
  v_new_balance integer;
BEGIN
  -- Check if caller is admin
  SELECT check_user_is_admin(p_admin_id) INTO v_is_admin;
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ban user (admin only)
CREATE OR REPLACE FUNCTION admin_ban_user(
  p_admin_id uuid,
  p_user_id uuid,
  p_reason text,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Check if caller is admin
  SELECT check_user_is_admin(p_admin_id) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Create ban record
  INSERT INTO user_bans (user_id, reason, banned_by, expires_at)
  VALUES (p_user_id, p_reason, p_admin_id, p_expires_at);
  
  -- Deactivate all user's ads
  UPDATE ads
  SET status = 'banned'
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unban user (admin only)
CREATE OR REPLACE FUNCTION admin_unban_user(
  p_admin_id uuid,
  p_user_id uuid
)
RETURNS jsonb AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Check if caller is admin
  SELECT check_user_is_admin(p_admin_id) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Deactivate all active bans
  UPDATE user_bans
  SET is_active = false,
      unbanned_at = now(),
      unbanned_by = p_admin_id
  WHERE user_id = p_user_id
    AND is_active = true;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get boost statistics
CREATE OR REPLACE FUNCTION get_boost_statistics()
RETURNS jsonb AS $$
DECLARE
  v_active_count integer;
  v_expired_count integer;
  v_total_coins_spent integer;
  v_avg_duration numeric;
BEGIN
  -- Get active boosts count
  SELECT COUNT(*) INTO v_active_count
  FROM listing_boosts
  WHERE is_active = true
    AND boost_end > now();
  
  -- Get expired boosts count
  SELECT COUNT(*) INTO v_expired_count
  FROM listing_boosts
  WHERE is_active = false OR boost_end <= now();
  
  -- Get total coins spent
  SELECT COALESCE(SUM(coins_spent), 0) INTO v_total_coins_spent
  FROM listing_boosts;
  
  -- Get average boost duration in days
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (boost_end - boost_start)) / 86400), 0) INTO v_avg_duration
  FROM listing_boosts;
  
  RETURN jsonb_build_object(
    'active_boosts', v_active_count,
    'expired_boosts', v_expired_count,
    'total_coins_spent', v_total_coins_spent,
    'avg_duration_days', ROUND(v_avg_duration, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
