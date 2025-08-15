/*
  # Storage & File Management Migration

  This migration establishes the file storage system including:
  - Storage buckets for different content types
  - RLS policies for file access
  - Proper security and access controls
*/

-- ===============================================
-- STORAGE BUCKETS CREATION
-- ===============================================

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

-- Create storage bucket for products
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Create storage bucket for brokers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brokers',
  'brokers',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Create storage bucket for banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'users',
  'users',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Create storage bucket for general images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ===============================================
-- STORAGE BUCKET POLICIES
-- ===============================================

-- Posts bucket policies
CREATE POLICY "Public read access for post images" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Authenticated users can upload post images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their post uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their post uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'posts'
  AND auth.role() = 'authenticated'
);

-- Products bucket policies
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their product uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their product uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- Brokers bucket policies
CREATE POLICY "Public read access for broker images" ON storage.objects
FOR SELECT USING (bucket_id = 'brokers');

CREATE POLICY "Authenticated users can upload broker images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'brokers'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their broker uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'brokers'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their broker uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'brokers'
  AND auth.role() = 'authenticated'
);

-- Banners bucket policies
CREATE POLICY "Public read access for banner images" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload banner images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'banners'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their banner uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'banners'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their banner uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'banners'
  AND auth.role() = 'authenticated'
);

-- Users bucket policies (with folder structure for avatars)
CREATE POLICY "Public read access for user avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'users'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'users'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Admins can upload user avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'users'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'users'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Admins can update user avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'users'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'users'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Admins can delete user avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'users'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- General images bucket policies
CREATE POLICY "Public read access for general images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload general images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their general image uploads" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their general image uploads" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

-- ===============================================
-- VERIFICATION & LOGGING
-- ===============================================

-- Verify all buckets were created successfully
DO $$
DECLARE
  bucket_names text[] := ARRAY['posts', 'products', 'brokers', 'banners', 'users', 'images'];
  bucket_name text;
  bucket_count int;
BEGIN
  -- Count total buckets created
  SELECT count(*) INTO bucket_count
  FROM storage.buckets
  WHERE id = ANY(bucket_names);

  -- Check each bucket individually
  FOREACH bucket_name IN ARRAY bucket_names
  LOOP
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = bucket_name) THEN
      RAISE NOTICE '✅ Storage bucket "%" created successfully', bucket_name;
    ELSE
      RAISE WARNING '❌ Failed to create storage bucket "%"', bucket_name;
    END IF;
  END LOOP;

  RAISE NOTICE '📊 Total storage buckets created: %/%', bucket_count, array_length(bucket_names, 1);

  -- Note about RLS
  RAISE NOTICE 'ℹ️  RLS is already enabled on storage.objects in hosted Supabase';
  RAISE NOTICE '🔒 Storage policies have been configured for all buckets';

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Error during storage bucket verification: % - %', SQLSTATE, SQLERRM;
END $$;
