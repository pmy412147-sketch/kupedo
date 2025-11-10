/*
  # Monetization and Premium Features Schema

  1. New Tables
    - `subscription_plans` - Available subscription tiers
    - `user_subscriptions` - User's active subscriptions
    - `listing_boosts` - Paid listing promotions
    - `featured_placements` - Homepage featured listings
    - `transactions` - Payment records
    - `dealer_profiles` - Professional dealer accounts

  2. Security
    - RLS enabled on all tables
    - Users can only manage their own subscriptions
    - Admins can manage plans and featured placements
*/

-- Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric NOT NULL,
  billing_period text NOT NULL, -- monthly, yearly
  features jsonb DEFAULT '{}',
  max_listings integer,
  boost_credits integer DEFAULT 0,
  featured_credits integer DEFAULT 0,
  analytics_enabled boolean DEFAULT false,
  priority_support boolean DEFAULT false,
  dealer_badge boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
  status text NOT NULL DEFAULT 'active', -- active, cancelled, expired
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  boost_credits_remaining integer DEFAULT 0,
  featured_credits_remaining integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Listing Boosts
CREATE TABLE IF NOT EXISTS listing_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  boost_type text NOT NULL, -- top, premium, urgent
  duration_hours integer NOT NULL DEFAULT 24,
  cost numeric NOT NULL,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_boosts_ad_id ON listing_boosts(ad_id);
CREATE INDEX IF NOT EXISTS idx_listing_boosts_active ON listing_boosts(is_active, expires_at);

ALTER TABLE listing_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage boosts for their ads"
  ON listing_boosts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view active boosts"
  ON listing_boosts FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND expires_at > now());

-- Featured Placements
CREATE TABLE IF NOT EXISTS featured_placements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  placement_type text NOT NULL, -- homepage_hero, category_top, search_top
  position integer DEFAULT 1,
  duration_hours integer NOT NULL DEFAULT 24,
  cost numeric NOT NULL,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_featured_placements_active ON featured_placements(is_active, expires_at, position);
CREATE INDEX IF NOT EXISTS idx_featured_placements_type ON featured_placements(placement_type, is_active);

ALTER TABLE featured_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage featured placements for their ads"
  ON featured_placements FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view active featured placements"
  ON featured_placements FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND expires_at > now());

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL, -- subscription, boost, featured, credits
  amount numeric NOT NULL,
  currency text DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method text,
  payment_provider text,
  provider_transaction_id text,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Dealer Profiles
CREATE TABLE IF NOT EXISTS dealer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name text NOT NULL,
  business_id text,
  vat_number text,
  description text,
  logo_url text,
  cover_image_url text,
  website text,
  office_address text,
  office_hours jsonb DEFAULT '{}',
  specializations text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  years_in_business integer,
  total_sales integer DEFAULT 0,
  verified boolean DEFAULT false,
  verified_at timestamptz,
  rating_average numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  response_rate numeric DEFAULT 0,
  response_time_hours numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dealer_profiles_user_id ON dealer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_dealer_profiles_verified ON dealer_profiles(verified);

ALTER TABLE dealer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dealer profiles"
  ON dealer_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Dealers can update their own profile"
  ON dealer_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can create dealer profile"
  ON dealer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price, billing_period, features, max_listings, boost_credits, analytics_enabled)
VALUES
  ('Free', 'free', 'Basic features for casual sellers', 0, 'monthly', '{"max_images": 5, "listing_duration": 30}', 3, 0, false),
  ('Basic', 'basic', 'Perfect for active sellers', 9.99, 'monthly', '{"max_images": 10, "listing_duration": 60, "priority_listing": true}', 10, 2, true),
  ('Pro', 'pro', 'For professional sellers', 24.99, 'monthly', '{"max_images": 20, "listing_duration": 90, "priority_listing": true, "featured_badge": true}', 50, 5, true),
  ('Dealer', 'dealer', 'Full-featured dealer account', 99.99, 'monthly', '{"max_images": 30, "listing_duration": 120, "priority_listing": true, "featured_badge": true, "dealer_tools": true}', 9999, 20, true)
ON CONFLICT (slug) DO NOTHING;

-- Function to deactivate expired promotions
CREATE OR REPLACE FUNCTION deactivate_expired_promotions()
RETURNS void AS $$
BEGIN
  -- Deactivate expired boosts
  UPDATE listing_boosts
  SET is_active = false
  WHERE is_active = true
    AND expires_at < now();

  -- Deactivate expired featured placements
  UPDATE featured_placements
  SET is_active = false
  WHERE is_active = true
    AND expires_at < now();

  -- Expire subscriptions
  UPDATE user_subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND current_period_end < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
