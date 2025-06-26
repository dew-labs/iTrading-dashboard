/*
  # Create RLS Policies for Posts Storage Bucket

  This migration creates the necessary RLS policies for the posts storage bucket.
  The bucket should already exist before running this migration.
  Note: RLS is already enabled on storage.objects in Supabase cloud by default.
*/

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public read access for post images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Policy 1: Allow public read access to images in posts bucket
CREATE POLICY "Public read access for post images" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

-- Policy 2: Allow authenticated users to upload images to posts bucket
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update their own uploads
CREATE POLICY "Users can update their own uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete their own uploads
CREATE POLICY "Users can delete their own uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

-- Verify the bucket exists (this will error if bucket doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'posts') THEN
    RAISE EXCEPTION 'Storage bucket "posts" does not exist. Please create it first via the Supabase dashboard.';
  END IF;

  RAISE NOTICE 'Storage policies for "posts" bucket created successfully!';
END
$$;
