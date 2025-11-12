/*
  # Fix User Coins Creation Trigger

  1. Changes
    - Drop the problematic trigger
    - Recreate the function with proper SECURITY DEFINER and error handling
    - Recreate the trigger

  2. Security
    - Function runs with DEFINER privileges to access system_settings
    - Includes comprehensive error handling
    - Logs errors but doesn't fail user creation
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created_coins ON auth.users;
DROP FUNCTION IF EXISTS create_user_coins_on_signup();

-- Recreate function with proper security and error handling
CREATE OR REPLACE FUNCTION create_user_coins_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  welcome_bonus integer := 100; -- default value
  setting_value jsonb;
BEGIN
  -- Try to get welcome bonus from settings
  BEGIN
    SELECT value INTO setting_value
    FROM system_settings
    WHERE key = 'welcome_bonus_coins';
    
    IF setting_value IS NOT NULL THEN
      welcome_bonus := (setting_value::text)::integer;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- If we can't read settings, use default
      RAISE WARNING 'Could not read system_settings, using default welcome bonus: %', SQLERRM;
  END;

  -- Create user_coins record with welcome bonus
  BEGIN
    INSERT INTO user_coins (user_id, balance)
    VALUES (NEW.id, welcome_bonus);
  EXCEPTION
    WHEN unique_violation THEN
      -- Record already exists, that's fine
      RETURN NEW;
    WHEN OTHERS THEN
      RAISE WARNING 'Could not create user_coins: %', SQLERRM;
      RETURN NEW;
  END;

  -- Log transaction
  BEGIN
    INSERT INTO coin_transactions (user_id, amount, transaction_type, description)
    VALUES (NEW.id, welcome_bonus, 'welcome_bonus', 'Welcome bonus for new user');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Could not log coin transaction: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created_coins
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_coins_on_signup();
