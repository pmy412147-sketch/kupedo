/*
  # Add 'paused' status to ads table

  1. Changes
    - Drop existing check constraint on ads.status
    - Create new check constraint that includes 'paused' status
    
  2. Allowed statuses
    - active: Inzerát je aktívny a viditeľný
    - paused: Inzerát je pozastavený používateľom
    - sold: Inzerát bol predaný
    - expired: Inzerát expiroval
    - deleted: Inzerát bol zmazaný
    - pending: Inzerát čaká na schválenie
    
  3. Security
    - No changes to RLS policies needed
*/

-- Drop existing constraint
ALTER TABLE ads DROP CONSTRAINT IF EXISTS ads_status_check;

-- Add new constraint with 'paused' status
ALTER TABLE ads ADD CONSTRAINT ads_status_check 
  CHECK (status IN ('active', 'paused', 'sold', 'expired', 'deleted', 'pending'));
