/*
  # Create Additional Storage Buckets

  This migration creates storage buckets for different content types and sets up the necessary RLS policies.
*/

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

-- Create storage bucket for general images (shared resources)
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

-- RLS policies for brokers bucket
CREATE POLICY "Authenticated users can upload broker images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'brokers'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public read access for broker images" ON storage.objects
FOR SELECT USING (bucket_id = 'brokers');

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

-- RLS policies for products bucket
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

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

-- RLS policies for banners bucket
CREATE POLICY "Authenticated users can upload banner images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'banners'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public read access for banner images" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

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

-- RLS policies for general images bucket
CREATE POLICY "Authenticated users can upload general images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Public read access for general images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

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

-- RLS is already enabled on storage.objects from previous migrations
