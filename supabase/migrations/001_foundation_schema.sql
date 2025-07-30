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
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS broker_account_types CASCADE;
DROP TABLE IF EXISTS brokers CASCADE;
DROP TABLE IF EXISTS broker_categories CASCADE;
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
  country varchar,
  city varchar,
  bio text,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Posts table (content management with author relationship)
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type post_type NOT NULL DEFAULT 'news',
  status post_status NOT NULL DEFAULT 'draft',
  views bigint DEFAULT 0 NOT NULL,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Products table (e-commerce/catalog items)
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price numeric NOT NULL,
  affiliate_link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Broker categories table (categories for brokers)
CREATE TABLE broker_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Brokers table (trading brokers/companies)
CREATE TABLE brokers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_visible boolean DEFAULT true,
  name varchar NOT NULL,
  headquarter varchar,
  established_in integer,
  category_id uuid REFERENCES broker_categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Broker account types table (account types for each broker)
CREATE TABLE broker_account_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  account_type varchar NOT NULL,
  spreads varchar,
  commission varchar,
  min_deposit varchar,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Banners table (promotional content)
CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_visible boolean DEFAULT true,
  name text NOT NULL,
  target_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Role permissions table (role-based permissions)
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_role_permission UNIQUE(role, resource, action)
);

-- Images table (centralized image management)
CREATE TABLE images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name varchar NOT NULL,
  record_id uuid NOT NULL,
  path text NOT NULL,
  type text,
  blurhash text,
  storage_object_id uuid,
  alt_text text,
  file_size bigint,
  mime_type varchar,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_email text,
  user_role user_role,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  ip_address text,
  user_agent text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===============================================
-- PERFORMANCE INDEXES
-- ===============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);

-- Images indexes
CREATE INDEX idx_images_table_record ON images(table_name, record_id);

-- ===============================================
-- ENABLE ROW LEVEL SECURITY
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_account_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- TABLE COMMENTS
-- ===============================================

COMMENT ON TABLE users IS 'Central user management with roles and permissions';
COMMENT ON TABLE posts IS 'Content management system with authorship and view tracking';
COMMENT ON TABLE products IS 'Product catalog with pricing and subscription options';
COMMENT ON TABLE broker_categories IS 'Categories for organizing different types of brokers';
COMMENT ON TABLE brokers IS 'Trading broker information and profiles';
COMMENT ON TABLE broker_account_types IS 'Account types and trading conditions for each broker';
COMMENT ON TABLE banners IS 'Promotional banner management system';
COMMENT ON TABLE role_permissions IS 'Role-based permission definitions';
COMMENT ON TABLE images IS 'Centralized image metadata and storage references';
COMMENT ON TABLE audit_logs IS 'Audit log of admin and moderator actions';

-- Column comments for important fields
COMMENT ON COLUMN brokers.established_in IS 'Year the broker was established (e.g., 1999, 2010)';
COMMENT ON COLUMN images.blurhash IS 'Blurhash string for low-res image placeholder.';
COMMENT ON COLUMN images.record_id IS 'UUID of the record this image belongs to (posts.id, products.id, etc.)';
COMMENT ON COLUMN posts.author_id IS 'Reference to the user who created this post';
COMMENT ON COLUMN posts.views IS 'Number of times this post has been viewed';
COMMENT ON COLUMN products.affiliate_link IS 'Affiliate link for the product (external or internal URL)';
