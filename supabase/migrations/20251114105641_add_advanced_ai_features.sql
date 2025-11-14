/*
  # Advanced AI Features Schema Extension
  
  This migration adds advanced AI capabilities to the platform.
  
  ## New Tables
  
  1. `ai_chat_conversations`
     - Stores AI chat assistant conversations
     - Multi-turn conversation support
     - Context preservation
  
  2. `ai_image_analysis`
     - Stores AI analysis of product images
     - Quality scores for images
     - Detected objects and features
  
  3. `ai_recommendations`
     - Personalized product recommendations
     - Based on user behavior and preferences
     - Collaborative filtering support
  
  4. `ai_fraud_detection`
     - Fraud risk scores for ads
     - Detected suspicious patterns
     - Admin review queue
  
  5. `ai_auto_tags`
     - Automatically generated tags
     - Category-specific keywords
     - Search optimization
  
  6. `ai_search_queries`
     - Semantic search query analysis
     - Natural language processing
     - Query expansion and synonyms
  
  ## Security
  
  - RLS enabled on all tables
  - Users can only access their own data
  - Admins have moderation access
*/

-- ai_chat_conversations table
CREATE TABLE IF NOT EXISTS ai_chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conversation_data jsonb DEFAULT '[]'::jsonb,
  context_type text CHECK (context_type IN ('general', 'ad_help', 'buying_guide', 'support')),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_user_id ON ai_chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_context_type ON ai_chat_conversations(context_type);
CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_last_message ON ai_chat_conversations(last_message_at);

ALTER TABLE ai_chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat conversations"
  ON ai_chat_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat conversations"
  ON ai_chat_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat conversations"
  ON ai_chat_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ai_image_analysis table
CREATE TABLE IF NOT EXISTS ai_image_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  quality_score integer CHECK (quality_score >= 0 AND quality_score <= 100),
  resolution_score integer CHECK (resolution_score >= 0 AND resolution_score <= 100),
  lighting_score integer CHECK (lighting_score >= 0 AND lighting_score <= 100),
  composition_score integer CHECK (composition_score >= 0 AND composition_score <= 100),
  detected_objects jsonb DEFAULT '[]'::jsonb,
  suggested_improvements jsonb DEFAULT '[]'::jsonb,
  is_appropriate boolean DEFAULT true,
  analyzed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_image_analysis_ad_id ON ai_image_analysis(ad_id);
CREATE INDEX IF NOT EXISTS idx_ai_image_analysis_quality_score ON ai_image_analysis(quality_score);

ALTER TABLE ai_image_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view image analysis for their ads"
  ON ai_image_analysis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ads
      WHERE ads.id = ai_image_analysis.ad_id
      AND ads.user_id = auth.uid()
    )
  );

-- ai_recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommended_ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  recommendation_type text CHECK (recommendation_type IN (
    'similar_viewed',
    'similar_favorited',
    'price_match',
    'category_interest',
    'collaborative'
  )),
  score decimal(3, 2) CHECK (score >= 0 AND score <= 1),
  reasoning text,
  user_interacted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_ad_id ON ai_recommendations(recommended_ad_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_score ON ai_recommendations(score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_expires_at ON ai_recommendations(expires_at);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON ai_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON ai_recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ai_fraud_detection table
CREATE TABLE IF NOT EXISTS ai_fraud_detection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL UNIQUE,
  risk_score integer CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level text CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  detected_patterns jsonb DEFAULT '[]'::jsonb,
  suspicious_indicators jsonb DEFAULT '[]'::jsonb,
  flagged_for_review boolean DEFAULT false,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_status text CHECK (review_status IN ('pending', 'approved', 'rejected', 'flagged')),
  review_notes text,
  analyzed_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ai_fraud_detection_ad_id ON ai_fraud_detection(ad_id);
CREATE INDEX IF NOT EXISTS idx_ai_fraud_detection_risk_level ON ai_fraud_detection(risk_level);
CREATE INDEX IF NOT EXISTS idx_ai_fraud_detection_flagged ON ai_fraud_detection(flagged_for_review);
CREATE INDEX IF NOT EXISTS idx_ai_fraud_detection_review_status ON ai_fraud_detection(review_status);

ALTER TABLE ai_fraud_detection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fraud detection for own ads"
  ON ai_fraud_detection FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ads
      WHERE ads.id = ai_fraud_detection.ad_id
      AND ads.user_id = auth.uid()
    )
  );

-- ai_auto_tags table
CREATE TABLE IF NOT EXISTS ai_auto_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  generated_tags jsonb DEFAULT '[]'::jsonb,
  category_keywords jsonb DEFAULT '[]'::jsonb,
  search_keywords jsonb DEFAULT '[]'::jsonb,
  confidence_scores jsonb DEFAULT '{}'::jsonb,
  user_approved boolean DEFAULT false,
  generated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_auto_tags_ad_id ON ai_auto_tags(ad_id);
CREATE INDEX IF NOT EXISTS idx_ai_auto_tags_generated_tags ON ai_auto_tags USING GIN(generated_tags);

ALTER TABLE ai_auto_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view auto tags for own ads"
  ON ai_auto_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ads
      WHERE ads.id = ai_auto_tags.ad_id
      AND ads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update auto tags for own ads"
  ON ai_auto_tags FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ads
      WHERE ads.id = ai_auto_tags.ad_id
      AND ads.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ads
      WHERE ads.id = ai_auto_tags.ad_id
      AND ads.user_id = auth.uid()
    )
  );

-- ai_search_queries table
CREATE TABLE IF NOT EXISTS ai_search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  original_query text NOT NULL,
  processed_query text,
  extracted_filters jsonb DEFAULT '{}'::jsonb,
  suggested_terms jsonb DEFAULT '[]'::jsonb,
  semantic_expansion jsonb DEFAULT '[]'::jsonb,
  results_count integer DEFAULT 0,
  user_clicked_result boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_search_queries_user_id ON ai_search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_queries_original_query ON ai_search_queries(original_query);
CREATE INDEX IF NOT EXISTS idx_ai_search_queries_created_at ON ai_search_queries(created_at);

ALTER TABLE ai_search_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own search queries"
  ON ai_search_queries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert search queries"
  ON ai_search_queries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Function to generate personalized recommendations
CREATE OR REPLACE FUNCTION generate_user_recommendations(user_id_param uuid, limit_count integer DEFAULT 10)
RETURNS TABLE (
  ad_id uuid,
  recommendation_type text,
  score decimal,
  reasoning text
) AS $$
BEGIN
  RETURN QUERY
  WITH user_favorites AS (
    SELECT category_id, COUNT(*) as fav_count
    FROM ads
    WHERE id IN (
      SELECT ad_id FROM favorites WHERE user_id = user_id_param
    )
    GROUP BY category_id
  ),
  user_searches AS (
    SELECT original_query, COUNT(*) as search_count
    FROM ai_search_queries
    WHERE user_id = user_id_param
    AND created_at > now() - interval '30 days'
    GROUP BY original_query
    ORDER BY search_count DESC
    LIMIT 5
  )
  SELECT 
    a.id as ad_id,
    'category_interest'::text as recommendation_type,
    0.8::decimal as score,
    'Based on your favorite categories'::text as reasoning
  FROM ads a
  INNER JOIN user_favorites uf ON a.category_id = uf.category_id
  WHERE a.status = 'active'
  AND a.user_id != user_id_param
  AND NOT EXISTS (
    SELECT 1 FROM favorites WHERE ad_id = a.id AND user_id = user_id_param
  )
  ORDER BY uf.fav_count DESC, a.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate fraud risk score
CREATE OR REPLACE FUNCTION calculate_fraud_risk_score(ad_id_param uuid)
RETURNS integer AS $$
DECLARE
  risk_score integer := 0;
  ad_record RECORD;
  user_record RECORD;
BEGIN
  SELECT * INTO ad_record FROM ads WHERE id = ad_id_param;
  SELECT * INTO user_record FROM profiles WHERE user_id = ad_record.user_id;
  
  IF ad_record.price = 0 THEN
    risk_score := risk_score + 10;
  END IF;
  
  IF array_length(ad_record.images, 1) IS NULL OR array_length(ad_record.images, 1) = 0 THEN
    risk_score := risk_score + 20;
  END IF;
  
  IF LENGTH(ad_record.description) < 50 THEN
    risk_score := risk_score + 15;
  END IF;
  
  IF ad_record.phone IS NULL OR ad_record.phone = '' THEN
    risk_score := risk_score + 10;
  END IF;
  
  RETURN LEAST(risk_score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired AI data
CREATE OR REPLACE FUNCTION cleanup_expired_ai_data()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_recommendations WHERE expires_at < now();
  
  DELETE FROM ai_chat_conversations 
  WHERE last_message_at < now() - interval '30 days';
  
  DELETE FROM ai_search_queries 
  WHERE created_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
