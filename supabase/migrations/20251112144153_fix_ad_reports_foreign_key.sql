/*
  # Fix ad_reports Foreign Key

  1. Problem
    - ad_reports table references 'advertisements' table which is empty
    - All ads are actually in 'ads' table (30 records)
    - This causes 409 conflict when trying to report ads
  
  2. Solution
    - Drop the wrong foreign key constraint
    - Add correct foreign key pointing to 'ads' table
  
  3. Security
    - Keep existing RLS policies intact
*/

-- Drop the incorrect foreign key
ALTER TABLE ad_reports 
  DROP CONSTRAINT IF EXISTS ad_reports_ad_id_fkey;

-- Add correct foreign key pointing to 'ads' table
ALTER TABLE ad_reports 
  ADD CONSTRAINT ad_reports_ad_id_fkey 
  FOREIGN KEY (ad_id) 
  REFERENCES ads(id) 
  ON DELETE CASCADE;
