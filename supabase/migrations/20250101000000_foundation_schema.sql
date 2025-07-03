/*
  # Foundation & Schema Migration

  This migration establishes the foundational database schema including:
  - Extensions and custom types
  - Core business tables
  - Performance indexes
  - Basic RLS enablement
*/

-- ===============================================
-- EXTENSIONS & TYPES
-- ===============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist and recreate
DO $$ BEGIN
    DROP TYPE IF EXISTS post_type CASCADE;
    DROP TYPE IF EXISTS post_status CASCADE;
    DROP TYPE IF EXISTS user_role CASCADE;
    DROP TYPE IF EXISTS user_status CASCADE;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create custom types
CREATE TYPE post_type AS ENUM ('news', 'event', 'terms_of_use', 'privacy_policy');
CREATE TYPE post_status AS ENUM ('draft', 'published');
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE user_status AS ENUM ('invited', 'active', 'inactive', 'suspended');

-- ===============================================
-- CORE TABLES
-- ===============================================

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS brokers CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (central user management)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role user_role NOT NULL DEFAULT 'user',
  status user_status NOT NULL DEFAULT 'active',
  phone text,
  avatar_url text,
  language_preference varchar DEFAULT 'en',
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts table (content management with author relationship)
CREATE TABLE posts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  content text,
  type post_type NOT NULL DEFAULT 'news',
  status post_status NOT NULL DEFAULT 'draft',
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  thumbnail_url text,
  views bigint DEFAULT 0 NOT NULL,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Products table (e-commerce/catalog items)
CREATE TABLE products (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name varchar NOT NULL,
  price numeric NOT NULL,
  description text,
  featured_image_url text,
  subscription boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Brokers table (trading brokers/companies)
CREATE TABLE brokers (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name varchar NOT NULL,
  established_in integer,
  headquarter text,
  description text,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

-- Banners table (promotional content)
CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User permissions table (granular user-specific permissions)
CREATE TABLE user_permissions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_permission UNIQUE(user_id, resource, action)
);

-- Role permissions table (role-based permissions)
CREATE TABLE role_permissions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  role user_role NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_role_permission UNIQUE(role, resource, action)
);

-- Images table (centralized image management)
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

-- Notifications table
CREATE TABLE notifications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  description text NOT NULL,
  user_id uuid REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- User notifications tracking table
CREATE TABLE user_notifications (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  notification_id bigint NOT NULL REFERENCES notifications(id) ON UPDATE CASCADE ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ===============================================
-- PERFORMANCE INDEXES
-- ===============================================

-- Posts indexes
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_status_type ON posts(status, type);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_views ON posts(views);

-- Products indexes
CREATE INDEX idx_products_subscription ON products(subscription);

-- Brokers indexes
CREATE INDEX idx_brokers_established_at ON brokers(established_in);
CREATE INDEX idx_brokers_created_at ON brokers(created_at);

-- Banners indexes
CREATE INDEX idx_banners_active ON banners(is_active);

-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);

-- Permissions indexes
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);

-- Images indexes
CREATE INDEX idx_images_table_record ON images(table_name, record_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(is_read);

-- ===============================================
-- ENABLE ROW LEVEL SECURITY
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- TABLE COMMENTS
-- ===============================================

COMMENT ON TABLE users IS 'Central user management with roles and permissions';
COMMENT ON TABLE posts IS 'Content management system with authorship and view tracking';
COMMENT ON TABLE products IS 'Product catalog with pricing and subscription options';
COMMENT ON TABLE brokers IS 'Trading broker information and profiles';
COMMENT ON TABLE banners IS 'Promotional banner management system';
COMMENT ON TABLE user_permissions IS 'User-specific permission overrides';
COMMENT ON TABLE role_permissions IS 'Role-based permission definitions';
COMMENT ON TABLE images IS 'Centralized image metadata and storage references';
COMMENT ON TABLE notifications IS 'System and user notifications';
COMMENT ON TABLE user_notifications IS 'User notification read/unread tracking';

-- Column comments for important fields
COMMENT ON COLUMN posts.author_id IS 'Reference to the user who created this post';
COMMENT ON COLUMN posts.views IS 'Number of times this post has been viewed';
COMMENT ON COLUMN posts.thumbnail_url IS 'Featured image for post listings and previews';
COMMENT ON COLUMN products.featured_image_url IS 'Main product image for display and listings';
COMMENT ON COLUMN brokers.logo_url IS 'Broker company logo/brand image';
COMMENT ON COLUMN brokers.established_in IS 'Year the broker was established (e.g., 1999, 2010)';
