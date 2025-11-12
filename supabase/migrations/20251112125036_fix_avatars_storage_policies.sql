/*
  # Fix avatars storage policies
  
  1. Changes
    - Drop existing INSERT policy for avatars
    - Recreate with correct type casting for auth.uid()
  
  2. Security
    - Ensures authenticated users can upload to their own folder
    - Uses proper UUID to text conversion
*/

-- Drop and recreate the INSERT policy with proper type casting
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );