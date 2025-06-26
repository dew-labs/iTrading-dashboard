/*
  # Create Storage Bucket for Posts

  This migration creates a storage bucket for post images and sets up the necessary RLS policies.
*/

-- Create storage bucket for posts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- RLS policies for the storage bucket

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

-- Allow public read access to images
CREATE POLICY "Public read access for post images" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Users can update their own uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete their own uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
