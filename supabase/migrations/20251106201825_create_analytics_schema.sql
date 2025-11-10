/*
  # Analytics and Insights Schema

  1. New Tables
    - `listing_views`
      - Tracks every view of an ad with source, device, and duration data
    
    - `listing_interactions`
      - Tracks user interactions like phone clicks, messages, saves, shares
    
    - `price_history`
      - Historical record of all price changes for trend analysis
    
    - `listing_experiments`
      - A/B testing data for titles, descriptions, and images
    
    - `competitor_listings`
      - Similar listings for competitive analysis
    
    - `performance_reports`
      - Weekly/monthly performance summaries sent to sellers

  2. Security
    - RLS enabled on all tables
    - Sellers can view analytics for their own ads only
    - Anonymous tracking allowed for views and interactions
*/

-- Create listing_views table (enhanced version of ad_views)
CREATE TABLE IF NOT EXISTS listing_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  source text DEFAULT 'direct',
  referrer text,
  device_type text DEFAULT 'desktop',
  duration integer DEFAULT 0,
  viewed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_views_ad_id ON listing_views(ad_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_viewed_at ON listing_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_listing_views_user_id ON listing_views(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_source ON listing_views(source);

ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create view records"
  ON listing_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view analytics for their ads"
  ON listing_views FOR SELECT
  TO authenticated
  USING (
    ad_id IN (
      SELECT id FROM ads WHERE user_id = auth.uid()
    )
  );

-- Create listing_interactions table
CREATE TABLE IF NOT EXISTS listing_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  action_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_interactions_ad_id ON listing_interactions(ad_id);
CREATE INDEX IF NOT EXISTS idx_listing_interactions_created_at ON listing_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_listing_interactions_action_type ON listing_interactions(action_type);

ALTER TABLE listing_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create interaction records"
  ON listing_interactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view interactions for their ads"
  ON listing_interactions FOR SELECT
  TO authenticated
  USING (
    ad_id IN (
      SELECT id FROM ads WHERE user_id = auth.uid()
    )
  );

-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  price numeric NOT NULL,
  changed_by uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  changed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_history_ad_id ON price_history(ad_id);
CREATE INDEX IF NOT EXISTS idx_price_history_changed_at ON price_history(changed_at);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view price history for their ads"
  ON price_history FOR SELECT
  TO authenticated
  USING (
    ad_id IN (
      SELECT id FROM ads WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create price history for their ads"
  ON price_history FOR INSERT
  TO authenticated
  WITH CHECK (
    ad_id IN (
      SELECT id FROM ads WHERE user_id = auth.uid()
    )
  );

-- Create listing_experiments table
CREATE TABLE IF NOT EXISTS listing_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  experiment_type text NOT NULL,
  variant_a text NOT NULL,
  variant_b text NOT NULL,
  variant_a_views integer DEFAULT 0,
  variant_b_views integer DEFAULT 0,
  variant_a_clicks integer DEFAULT 0,
  variant_b_clicks integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  winner text
);

CREATE INDEX IF NOT EXISTS idx_listing_experiments_ad_id ON listing_experiments(ad_id);

ALTER TABLE listing_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage experiments for their ads"
  ON listing_experiments FOR ALL
  TO authenticated
  USING (
    ad_id IN (
      SELECT id FROM ads WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    ad_id IN (
      SELECT id FROM ads WHERE user_id = auth.uid()
    )
  );

-- Create competitor_listings table
CREATE TABLE IF NOT EXISTS competitor_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  competitor_ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  similarity_score numeric NOT NULL,
  price_difference numeric NOT NULL,
  analyzed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitor_listings_ad_id ON competitor_listings(ad_id);
CREATE INDEX IF NOT EXISTS idx_competitor_listings_analyzed_at ON competitor_listings(analyzed_at);

ALTER TABLE competitor_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view competitors for their ads"
  ON competitor_listings FOR SELECT
  TO authenticated
  USING (
    ad_id IN (
      SELECT id FROM ads WHERE user_id = auth.uid()
    )
  );

-- Create performance_reports table
CREATE TABLE IF NOT EXISTS performance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  report_type text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_views integer DEFAULT 0,
  total_interactions integer DEFAULT 0,
  report_data jsonb DEFAULT '{}',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_reports_user_id ON performance_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_reports_created_at ON performance_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_reports_period ON performance_reports(period_start, period_end);

ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON performance_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to track price changes
CREATE OR REPLACE FUNCTION track_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO price_history (ad_id, price, changed_by)
    VALUES (NEW.id, NEW.price, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for price changes
DROP TRIGGER IF EXISTS trigger_track_price_change ON ads;
CREATE TRIGGER trigger_track_price_change
  AFTER UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION track_price_change();
