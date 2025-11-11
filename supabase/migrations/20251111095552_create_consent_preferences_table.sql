/*
  # User Consent Preferences Schema

  1. New Tables
    - `consent_preferences`
      - `id` (uuid, primary key) - Unique identifier for each consent record
      - `user_id` (uuid, foreign key to auth.users) - Reference to the user
      - `ad_storage` (boolean) - Consent for ad storage
      - `ad_user_data` (boolean) - Consent for user data in ads
      - `ad_personalization` (boolean) - Consent for ad personalization
      - `analytics_storage` (boolean) - Consent for analytics storage
      - `consent_version` (text) - Version of consent dialog shown
      - `ip_address` (text, nullable) - IP address at time of consent (for audit)
      - `user_agent` (text, nullable) - User agent at time of consent (for audit)
      - `created_at` (timestamptz) - When consent was first given
      - `updated_at` (timestamptz) - When consent was last updated

  2. Security
    - Enable RLS on `consent_preferences` table
    - Users can read their own consent preferences
    - Users can insert/update their own consent preferences
    - Only authenticated users can manage consent preferences

  3. Indexes
    - Index on user_id for fast lookups
    - Index on updated_at for audit purposes
*/

CREATE TABLE IF NOT EXISTS consent_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ad_storage boolean DEFAULT false NOT NULL,
  ad_user_data boolean DEFAULT false NOT NULL,
  ad_personalization boolean DEFAULT false NOT NULL,
  analytics_storage boolean DEFAULT false NOT NULL,
  consent_version text DEFAULT 'v1' NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_consent_preferences_user_id ON consent_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_preferences_updated_at ON consent_preferences(updated_at);

ALTER TABLE consent_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own consent preferences"
  ON consent_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent preferences"
  ON consent_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consent preferences"
  ON consent_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own consent preferences"
  ON consent_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_consent_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consent_preferences_updated_at
  BEFORE UPDATE ON consent_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_consent_preferences_updated_at();
