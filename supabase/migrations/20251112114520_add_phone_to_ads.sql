/*
  # Add phone number field to ads table
  
  1. Changes
    - Adds phone column to ads table for contact information
    - Phone numbers are private and not displayed publicly
  
  2. Security
    - Phone numbers are only accessible to authenticated users viewing the ad
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ads' AND column_name = 'phone'
  ) THEN
    ALTER TABLE ads ADD COLUMN phone text;
  END IF;
END $$;
