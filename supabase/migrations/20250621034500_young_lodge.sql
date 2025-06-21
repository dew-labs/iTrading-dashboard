/*
  # Complete Database Schema Migration

  1. New Tables
    - `posts` - Content management with 4 types (news, event, terms_of_use, privacy_policy)
    - `products` - Simplified product catalog (no category, no stock, subscription model)
    - `banners` - Minimal banner system (no placement, no performance tracking)
    - `user_profiles` - User preferences and settings
    - `images` - Centralized image management for all tables
    - `notifications` - System and user notifications
    - `user_notifications` - Notification read status tracking

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for public/authenticated access
    - Proper foreign key constraints

  3. Performance
    - Add indexes for common queries
    - Optimize for typical usage patterns
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing type if it exists and recreate
DO $$ BEGIN
    DROP TYPE IF EXISTS post_type CASCADE;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create custom types
CREATE TYPE post_type AS ENUM ('news', 'event', 'terms_of_use', 'privacy_policy');

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- Posts table (content management)
CREATE TABLE posts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  content text,
  type post_type NOT NULL DEFAULT 'news',
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Products table (simplified - no category, no stock, no image_url)
CREATE TABLE products (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name varchar NOT NULL,
  price numeric NOT NULL,
  description text,
  subscription boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Banners table (minimal - no placement, no performance, no image_url)
CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  language_preference varchar DEFAULT 'en'
);

-- Images table (centralized image management)
-- Using text for record_id to handle both bigint and uuid references
CREATE TABLE images (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  table_name varchar NOT NULL,
  record_id text NOT NULL,
  image_url text NOT NULL,
  storage_object_id uuid,
  alt_text text,
  file_size bigint,
  mime_type varchar,
  created_at timestamptz DEFAULT now()
);

-- Notifications table (updated structure)
CREATE TABLE notifications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  description text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- User notifications tracking table
CREATE TABLE user_notifications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  notification_id bigint NOT NULL REFERENCES notifications(id) ON UPDATE CASCADE ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts (public read, authenticated write)
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for products (public read, authenticated write)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for banners (public read, authenticated write)
CREATE POLICY "Active banners are viewable by everyone"
  ON banners FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "All banners are viewable by authenticated users"
  ON banners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert banners"
  ON banners FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update banners"
  ON banners FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete banners"
  ON banners FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for user_profiles (users can only access their own)
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for images (public read, authenticated write)
CREATE POLICY "Images are viewable by everyone"
  ON images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert images"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update images"
  ON images FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete images"
  ON images FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for notifications (users see their own + system-wide)
CREATE POLICY "Users can view their notifications and system notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for user_notifications (users can only access their own)
CREATE POLICY "Users can view own notification status"
  ON user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification status"
  ON user_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification status"
  ON user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification status"
  ON user_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_products_subscription ON products(subscription);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_images_table_record ON images(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(is_read);

-- Insert sample data for development

-- Sample posts
INSERT INTO posts (title, content, type) VALUES
('Welcome to Our Platform', 'We are excited to announce the launch of our new platform. This marks a significant milestone in our journey to provide better services to our users.', 'news'),
('Upcoming Maintenance Window', 'We will be performing scheduled maintenance on our systems this weekend. Please expect brief service interruptions.', 'news'),
('Annual Conference 2024', 'Join us for our annual conference featuring industry leaders, workshops, and networking opportunities. Registration is now open.', 'event'),
('Product Launch Event', 'We are hosting an exclusive product launch event next month. Limited seats available for this special occasion.', 'event'),
('Terms of Use', 'By using our platform, you agree to comply with and be bound by the following terms and conditions of use. These terms govern your access to and use of our services.', 'terms_of_use'),
('Privacy Policy', 'This Privacy Policy describes how we collect, use, and protect your personal information when you use our services. We are committed to protecting your privacy.', 'privacy_policy');

-- Sample products
INSERT INTO products (name, price, description, subscription) VALUES
('Premium Plan', 29.99, 'Access to all premium features including advanced analytics, priority support, and unlimited storage.', true),
('Professional Tools', 99.99, 'Complete set of professional tools for advanced users. One-time purchase with lifetime updates.', false),
('Enterprise Solution', 199.99, 'Comprehensive enterprise solution with dedicated support, custom integrations, and advanced security.', true),
('Starter Package', 9.99, 'Perfect for beginners. Includes basic features and email support.', true),
('Custom Development', 499.99, 'Custom development services tailored to your specific needs. Includes consultation and implementation.', false),
('Analytics Dashboard', 49.99, 'Advanced analytics and reporting dashboard with real-time insights and custom metrics.', true);

-- Sample banners
INSERT INTO banners (target_url, is_active) VALUES
('https://example.com/welcome', true),
('https://example.com/promotion', true),
('https://example.com/new-features', true),
('https://example.com/maintenance', false);

-- Sample notifications (system-wide)
INSERT INTO notifications (title, description, user_id) VALUES
('Welcome to the Platform', 'Thank you for joining our platform. We are excited to have you on board and look forward to helping you achieve your goals!', NULL),
('System Maintenance Scheduled', 'We will be performing system maintenance this weekend from 2:00 AM to 6:00 AM UTC. Please save your work and expect brief service interruptions.', NULL),
('New Features Available', 'Check out our latest features including improved dashboard, enhanced security, and better performance monitoring tools.', NULL),
('Security Update', 'We have implemented additional security measures to protect your data. Please review your account settings and update your password if needed.', NULL);

-- Sample images (demonstrating the centralized image system)
-- Using text values for record_id to handle both bigint and uuid references
INSERT INTO images (table_name, record_id, image_url, alt_text, mime_type) VALUES
('products', '1', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'Premium Plan illustration', 'image/jpeg'),
('products', '2', 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg', 'Professional Tools showcase', 'image/jpeg'),
('products', '3', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg', 'Enterprise Solution overview', 'image/jpeg'),
('posts', '1', 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg', 'Welcome announcement image', 'image/jpeg'),
('posts', '3', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg', 'Conference event image', 'image/jpeg');

-- Add banner images after banners are created
DO $$
DECLARE
    banner_id_1 uuid;
    banner_id_2 uuid;
BEGIN
    -- Get banner IDs
    SELECT id INTO banner_id_1 FROM banners WHERE target_url = 'https://example.com/welcome' LIMIT 1;
    SELECT id INTO banner_id_2 FROM banners WHERE target_url = 'https://example.com/promotion' LIMIT 1;
    
    -- Insert banner images
    IF banner_id_1 IS NOT NULL THEN
        INSERT INTO images (table_name, record_id, image_url, alt_text, mime_type) 
        VALUES ('banners', banner_id_1::text, 'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg', 'Welcome banner image', 'image/jpeg');
    END IF;
    
    IF banner_id_2 IS NOT NULL THEN
        INSERT INTO images (table_name, record_id, image_url, alt_text, mime_type) 
        VALUES ('banners', banner_id_2::text, 'https://images.pexels.com/photos/586996/pexels-photo-586996.jpeg', 'Promotion banner image', 'image/jpeg');
    END IF;
END $$;