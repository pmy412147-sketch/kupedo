-- Create Storage Bucket for Ad Images
-- 
-- 1. New Storage Bucket: ad-images bucket for storing ad photos with public access
-- 2. Security Policies: Authenticated users can upload to their folder, anyone can view
-- 3. Configuration: Max 5MB, allowed types: jpeg, png, webp

-- Create the ad-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-images',
  'ad-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Policy: Anyone can view images (public bucket)
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-images');

-- Policy: Authenticated users can upload images to their own folder
CREATE POLICY "Authenticated users can upload images to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ad-images' AND
  (storage.foldername(name))[1] = 'ads' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ad-images' AND
  (storage.foldername(name))[1] = 'ads' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ad-images' AND
  (storage.foldername(name))[1] = 'ads' AND
  (storage.foldername(name))[2] = auth.uid()::text
);
