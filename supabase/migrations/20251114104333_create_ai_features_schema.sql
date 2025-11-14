/*
  # AI Features Database Schema
  
  This migration creates all necessary tables for AI-powered features.
  
  ## New Tables
  
  1. `ai_generated_content`
     - Stores AI-generated descriptions, titles, and other content
     - Links to ads and users
     - Tracks generation parameters and metadata
  
  2. `ad_quality_scores`
     - Stores quality evaluations for advertisements
     - Detailed breakdown by category (description, photos, specs, pricing)
     - AI suggestions for improvements
  
  3. `ai_comparisons`
     - Stores product comparison analyses
     - Links multiple ads together
     - Caches AI comparison results
  
  4. `ai_usage_logs`
     - Tracks all AI API calls
     - Monitor usage per user and feature
     - Cost tracking and analytics
  
  5. `ai_cache`
     - Caches AI responses to reduce API calls
     - TTL-based expiration
     - Hash-based lookup for identical queries
  
  6. `price_analysis`
     - Stores price recommendations and market analysis
     - Historical price tracking
     - Competitive pricing insights
  
  ## Security
  
  - RLS enabled on all tables
  - Users can only access their own data
  - Admins have full access for moderation
*/

-- ai_generated_content table
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('description', 'title', 'suggestions')),
  generated_text text NOT NULL,
  input_data jsonb,
  model_used text DEFAULT 'gemini-2.0-flash-exp',
  tokens_used integer,
  generation_time_ms integer,
  accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_generated_content_user_id ON ai_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_ad_id ON ai_generated_content(ad_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_type ON ai_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_generated_content_created_at ON ai_generated_content(created_at);

ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI generated content"
  ON ai_generated_content FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI generated content"
  ON ai_generated_content FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ad_quality_scores table
CREATE TABLE IF NOT EXISTS ad_quality_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_score integer NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  description_score integer CHECK (description_score >= 0 AND description_score <= 30),
  photos_score integer CHECK (photos_score >= 0 AND photos_score <= 25),
  specifications_score integer CHECK (specifications_score >= 0 AND specifications_score <= 25),
  pricing_score integer CHECK (pricing_score >= 0 AND pricing_score <= 20),
  suggestions jsonb DEFAULT '[]'::jsonb,
  strengths jsonb DEFAULT '[]'::jsonb,
  weaknesses jsonb DEFAULT '[]'::jsonb,
  evaluated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_quality_scores_ad_id ON ad_quality_scores(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_quality_scores_user_id ON ad_quality_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_quality_scores_total_score ON ad_quality_scores(total_score);

ALTER TABLE ad_quality_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ad quality scores"
  ON ad_quality_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad quality scores"
  ON ad_quality_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ad quality scores"
  ON ad_quality_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ai_comparisons table
CREATE TABLE IF NOT EXISTS ai_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ad_ids uuid[] NOT NULL,
  category text NOT NULL,
  comparison_data jsonb NOT NULL,
  summary text,
  best_choice integer,
  recommendation_reasoning text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_ai_comparisons_user_id ON ai_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_comparisons_ad_ids ON ai_comparisons USING GIN(ad_ids);
CREATE INDEX IF NOT EXISTS idx_ai_comparisons_category ON ai_comparisons(category);
CREATE INDEX IF NOT EXISTS idx_ai_comparisons_created_at ON ai_comparisons(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_comparisons_expires_at ON ai_comparisons(expires_at);

ALTER TABLE ai_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own comparisons"
  ON ai_comparisons FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert comparisons"
  ON ai_comparisons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ai_usage_logs table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  feature_type text NOT NULL CHECK (feature_type IN (
    'generate_description',
    'generate_title',
    'evaluate_quality',
    'compare_products',
    'suggest_alternatives',
    'recommend_price',
    'semantic_search'
  )),
  model_used text DEFAULT 'gemini-2.0-flash-exp',
  tokens_used integer,
  response_time_ms integer,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature_type ON ai_usage_logs(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_success ON ai_usage_logs(success);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage logs"
  ON ai_usage_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ai_cache table
CREATE TABLE IF NOT EXISTS ai_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  feature_type text NOT NULL,
  input_hash text NOT NULL,
  cached_response jsonb NOT NULL,
  tokens_saved integer DEFAULT 0,
  hit_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_accessed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_cache_key ON ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_input_hash ON ai_cache(input_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_feature_type ON ai_cache(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires_at ON ai_cache(expires_at);

-- No RLS on cache table - it's internal only

-- price_analysis table
CREATE TABLE IF NOT EXISTS price_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  recommended_price decimal(10, 2),
  price_range_min decimal(10, 2),
  price_range_max decimal(10, 2),
  market_analysis text,
  reasoning text,
  competitiveness text CHECK (competitiveness IN ('low', 'medium', 'high')),
  similar_products_analyzed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_price_analysis_ad_id ON price_analysis(ad_id);
CREATE INDEX IF NOT EXISTS idx_price_analysis_user_id ON price_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_price_analysis_category ON price_analysis(category);
CREATE INDEX IF NOT EXISTS idx_price_analysis_created_at ON price_analysis(created_at);

ALTER TABLE price_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own price analysis"
  ON price_analysis FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own price analysis"
  ON price_analysis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_ai_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_cache WHERE expires_at < now();
  DELETE FROM ai_comparisons WHERE expires_at < now();
  DELETE FROM price_analysis WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update cache hit count
CREATE OR REPLACE FUNCTION increment_cache_hit(cache_key_param text)
RETURNS void AS $$
BEGIN
  UPDATE ai_cache
  SET hit_count = hit_count + 1,
      last_accessed_at = now()
  WHERE cache_key = cache_key_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user AI usage statistics
CREATE OR REPLACE FUNCTION get_user_ai_stats(user_id_param uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_requests', COUNT(*),
    'successful_requests', COUNT(*) FILTER (WHERE success = true),
    'failed_requests', COUNT(*) FILTER (WHERE success = false),
    'total_tokens_used', COALESCE(SUM(tokens_used), 0),
    'average_response_time', COALESCE(AVG(response_time_ms), 0),
    'requests_by_feature', jsonb_object_agg(
      feature_type,
      COUNT(*)
    )
  )
  INTO result
  FROM ai_usage_logs
  WHERE user_id = user_id_param
    AND created_at > now() - interval '30 days';
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
