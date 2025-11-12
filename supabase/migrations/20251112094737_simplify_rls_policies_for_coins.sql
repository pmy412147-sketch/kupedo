/*
  # Simplify RLS Policies for Coin System

  1. Changes
    - Drop complex admin policies that may cause circular dependencies
    - Create simpler policies that work reliably
    - Maintain security while improving stability

  2. Security
    - Users can only see their own coins and transactions
    - Everyone can see active coin packages
    - Service role maintains full access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own coin balance" ON user_coins;
DROP POLICY IF EXISTS "System can insert user coins" ON user_coins;
DROP POLICY IF EXISTS "System can update user coins" ON user_coins;
DROP POLICY IF EXISTS "Admins can view all coin balances" ON user_coins;

DROP POLICY IF EXISTS "Users can view own transactions" ON coin_transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON coin_transactions;

DROP POLICY IF EXISTS "Everyone can view active packages" ON coin_packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON coin_packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON coin_packages;

-- Create new simplified policies for user_coins
CREATE POLICY "Users can view own coins"
  ON user_coins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage user coins"
  ON user_coins FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create new simplified policies for coin_transactions
CREATE POLICY "Users can view own transactions"
  ON coin_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
  ON coin_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create new simplified policies for coin_packages
CREATE POLICY "Everyone can view active packages"
  ON coin_packages FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Allow service role full access to all tables
CREATE POLICY "Service role full access to user_coins"
  ON user_coins FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to coin_transactions"
  ON coin_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to coin_packages"
  ON coin_packages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
