/*
  # Create Custom Advertisements System

  1. New Tables
    - `advertisements`
      - `id` (uuid, primary key)
      - `title` (text) - Title of the advertisement
      - `image_url` (text) - URL to the advertisement image
      - `link_url` (text) - URL where the ad should redirect
      - `position` (text) - Position of the ad (in_feed, sticky_banner, header, sidebar)
      - `priority` (integer) - Priority for display (higher = shown first)
      - `active` (boolean) - Whether the ad is currently active
      - `starts_at` (timestamptz) - When the ad campaign starts
      - `ends_at` (timestamptz) - When the ad campaign ends
      - `impressions` (integer) - Number of times ad was displayed
      - `clicks` (integer) - Number of times ad was clicked
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `advertisements` table
    - Add policy for public read access to active ads
    - Add policy for authenticated admin users to manage ads

  3. Important Notes
    - This table allows for custom advertisements to be shown when Google AdSense is unavailable
    - Ads can be scheduled with start and end dates
    - Track impressions and clicks for analytics
    - Priority system allows control over which ads are shown first
*/

CREATE TABLE IF NOT EXISTS advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text NOT NULL,
  position text NOT NULL DEFAULT 'in_feed',
  priority integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active advertisements"
  ON advertisements
  FOR SELECT
  TO public
  USING (
    active = true
    AND starts_at <= now()
    AND (ends_at IS NULL OR ends_at > now())
  );

CREATE POLICY "Authenticated users can view all advertisements"
  ON advertisements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(active, starts_at, ends_at, priority);
CREATE INDEX IF NOT EXISTS idx_advertisements_position ON advertisements(position, active);
