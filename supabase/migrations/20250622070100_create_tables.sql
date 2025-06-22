/*
  # Create Tables Migration

  This migration creates all the main tables for the application.
*/

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- Posts table (content management with status)
CREATE TABLE posts (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  content text,
  type post_type NOT NULL DEFAULT 'news',
  status post_status NOT NULL DEFAULT 'draft',
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

-- Users table (merged with user_profiles, extended with role management)
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

-- User permissions table (user-specific permissions)
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
