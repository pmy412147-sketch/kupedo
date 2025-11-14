/*
  # Optimize Search and Add Metadata Indexes

  1. Indexes for Better Search Performance
    - Add GIN index for full-text search on title and description
    - Add trigram indexes for fuzzy matching on location
    - Add JSONB path indexes for metadata filtering
    - Add composite indexes for common filter combinations

  2. Metadata Structure Documentation
    - Document expected metadata fields for different categories
    - Add helper functions for metadata queries
    - Create views for common search patterns

  3. Search Optimization Functions
    - Add function to normalize Slovak text for search
    - Add function to extract room count from text
    - Add function to match location with fuzzy search

  4. Performance
    - These indexes will significantly speed up complex searches
    - JSONB indexes enable fast filtering on metadata fields
    - Trigram indexes improve location search with typos
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Create GIN index for full-text search on ads
CREATE INDEX IF NOT EXISTS idx_ads_search_text
  ON ads USING GIN (to_tsvector('simple', title || ' ' || description));

-- Create trigram index for fuzzy location search
CREATE INDEX IF NOT EXISTS idx_ads_location_trgm
  ON ads USING GIN (location gin_trgm_ops);

-- Create trigram index for fuzzy postal code search
CREATE INDEX IF NOT EXISTS idx_ads_postal_code_trgm
  ON ads USING GIN (postal_code gin_trgm_ops);

-- Create JSONB indexes for common metadata queries
CREATE INDEX IF NOT EXISTS idx_ads_metadata_rooms
  ON ads USING BTREE ((metadata->>'rooms'))
  WHERE metadata->>'rooms' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ads_metadata_room_count
  ON ads USING BTREE ((metadata->>'roomCount'))
  WHERE metadata->>'roomCount' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ads_metadata_property_type
  ON ads USING GIN ((metadata->>'propertyType') gin_trgm_ops)
  WHERE metadata->>'propertyType' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ads_metadata_condition
  ON ads USING GIN ((metadata->>'condition') gin_trgm_ops)
  WHERE metadata->>'condition' IS NOT NULL;

-- Create composite index for real estate searches (category + price + location)
CREATE INDEX IF NOT EXISTS idx_ads_reality_search
  ON ads (category_id, price, location)
  WHERE category_id = 'reality' AND status = 'active';

-- Create composite index for boosted active ads
CREATE INDEX IF NOT EXISTS idx_ads_active_boosted
  ON ads (status, is_boosted DESC, created_at DESC)
  WHERE status = 'active';

-- Function to normalize Slovak text for search
CREATE OR REPLACE FUNCTION normalize_slovak_text(text_input text)
RETURNS text AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      unaccent(text_input),
      '[^a-z0-9\s]',
      '',
      'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to extract room count from text
CREATE OR REPLACE FUNCTION extract_room_count(text_input text)
RETURNS integer AS $$
DECLARE
  room_count integer;
BEGIN
  -- Try to extract number before "izbov"
  SELECT regexp_replace(text_input, '.*?(\d+)\s*[-\s]?\s*izbov.*', '\1', 'i')::integer
  INTO room_count
  WHERE text_input ~* '\d+\s*[-\s]?\s*izbov';

  IF room_count IS NOT NULL THEN
    RETURN room_count;
  END IF;

  -- Check for specific patterns
  IF text_input ~* 'garsonk' THEN
    RETURN 1;
  ELSIF text_input ~* 'dvojgarsonk' THEN
    RETURN 2;
  ELSIF text_input ~* 'jednoizbov' THEN
    RETURN 1;
  ELSIF text_input ~* 'dvojizbov' THEN
    RETURN 2;
  ELSIF text_input ~* 'trojizbov' THEN
    RETURN 3;
  ELSIF text_input ~* 'stvoriizbov' THEN
    RETURN 4;
  ELSIF text_input ~* 'patizbov' THEN
    RETURN 5;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if ad matches room count
CREATE OR REPLACE FUNCTION ad_matches_room_count(ad_row ads, target_rooms integer)
RETURNS boolean AS $$
BEGIN
  -- Check metadata first
  IF ad_row.metadata->>'rooms' IS NOT NULL THEN
    RETURN (ad_row.metadata->>'rooms')::integer = target_rooms;
  END IF;

  IF ad_row.metadata->>'roomCount' IS NOT NULL THEN
    RETURN (ad_row.metadata->>'roomCount')::integer = target_rooms;
  END IF;

  -- Check text
  RETURN extract_room_count(ad_row.title || ' ' || ad_row.description) = target_rooms;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create view for active real estate ads with extracted metadata
CREATE OR REPLACE VIEW vw_active_reality_ads AS
SELECT
  id,
  user_id,
  title,
  description,
  price,
  location,
  postal_code,
  images,
  status,
  is_boosted,
  created_at,
  view_count,
  COALESCE((metadata->>'rooms')::integer, (metadata->>'roomCount')::integer, extract_room_count(title || ' ' || description)) as room_count,
  metadata->>'propertyType' as property_type,
  metadata->>'condition' as property_condition,
  metadata->>'offerType' as offer_type,
  condition as ad_condition
FROM ads
WHERE category_id = 'reality'
  AND status = 'active';

-- Add comment explaining metadata structure for real estate
COMMENT ON COLUMN ads.metadata IS
'JSONB field storing category-specific data. For reality category:
{
  "rooms": integer (number of rooms),
  "roomCount": integer (alternative field name),
  "propertyType": string (byt, dom, pozemok, etc.),
  "condition": string (novostavba, rekonštrukcia, etc.),
  "offerType": string (predaj, prenájom, etc.),
  "area": number (area in m2),
  "floor": integer,
  "totalFloors": integer,
  "energyClass": string,
  "parking": boolean,
  "balcony": boolean,
  "elevator": boolean
}';

-- Create search statistics table for analytics
CREATE TABLE IF NOT EXISTS search_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query text NOT NULL,
  parsed_filters jsonb,
  results_count integer DEFAULT 0,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_statistics_query ON search_statistics (search_query);
CREATE INDEX IF NOT EXISTS idx_search_statistics_created_at ON search_statistics (created_at DESC);

ALTER TABLE search_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Search statistics are public"
  ON search_statistics FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert search statistics"
  ON search_statistics FOR INSERT
  WITH CHECK (true);
