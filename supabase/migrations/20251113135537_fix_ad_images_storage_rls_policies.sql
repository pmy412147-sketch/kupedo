/*
  # Fix Storage RLS Policies for Ad Images

  1. Changes
    - Drop existing restrictive policies on ad-images bucket
    - Create new policies that allow authenticated users to upload images
    - Allow public read access (bucket is already public)
    - Allow users to upload to their own user_id folder
    - Allow users to update/delete their own images

  2. Security
    - Users can only upload to folders with their user_id
    - Users can only delete/update their own images
    - Public can read all images (for displaying ads)
*/

DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload ad images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own images" ON storage.objects;

CREATE POLICY "Public can view ad images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'ad-images');

CREATE POLICY "Authenticated users can upload ad images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ad-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own ad images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'ad-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'ad-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own ad images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'ad-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
