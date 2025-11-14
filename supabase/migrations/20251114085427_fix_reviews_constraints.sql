/*
  # Fix reviews constraints and allow multiple reviews

  1. Changes
    - Drop unique constraint that prevents multiple reviews
    - Add new constraint that allows one review per reviewer-reviewed user pair (without ad_id)
    - This allows users to leave multiple reviews for the same person for different transactions
    
  2. Reasoning
    - Original constraint: reviews_reviewer_id_reviewed_user_id_ad_id_key prevented any duplicate
    - New approach: Allow multiple reviews, but only one review per transaction (if ad_id is provided)
    - Users can leave general reviews (without ad_id) multiple times
    
  3. Security
    - No changes to RLS policies needed
*/

-- Drop the problematic unique constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_reviewed_user_id_ad_id_key;

-- Add a new partial unique constraint: only one review per reviewer-user-ad combination when ad_id is not null
CREATE UNIQUE INDEX reviews_per_ad_unique 
  ON reviews (reviewer_id, reviewed_user_id, ad_id) 
  WHERE ad_id IS NOT NULL;

-- Note: This allows multiple general reviews (where ad_id is NULL) from the same reviewer to the same user
