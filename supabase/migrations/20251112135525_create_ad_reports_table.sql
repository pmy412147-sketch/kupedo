/*
  # Create Ad Reports System

  1. New Table
    - `ad_reports`
      - `id` (uuid, primary key)
      - `ad_id` (uuid, references advertisements)
      - `reporter_id` (uuid, references profiles)
      - `reason` (text)
      - `description` (text)
      - `status` (text) - pending, reviewed, resolved
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Users can create reports
    - Users can view their own reports
*/

CREATE TABLE IF NOT EXISTS ad_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id uuid REFERENCES advertisements(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ad_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON ad_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON ad_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE INDEX IF NOT EXISTS idx_ad_reports_status ON ad_reports(status);
CREATE INDEX IF NOT EXISTS idx_ad_reports_ad ON ad_reports(ad_id);
