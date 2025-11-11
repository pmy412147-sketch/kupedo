/*
  # Fix coin packages visibility
  
  1. Security Changes
    - Add policy to allow anonymous users to view active coin packages
    - This allows the packages to be visible on the /mince page even for logged-in users
    
  2. Notes
    - Authenticated users already have access via existing policy
    - This adds access for all users (including authenticated) to view active packages
*/

-- Drop the restrictive policy that only allows authenticated users
DROP POLICY IF EXISTS "Anyone can view active packages" ON coin_packages;

-- Create a new policy that allows everyone (including anon) to view active packages
CREATE POLICY "Everyone can view active packages"
  ON coin_packages
  FOR SELECT
  TO public
  USING (is_active = true);
