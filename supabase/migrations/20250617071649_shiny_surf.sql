/*
  # Initial Database Schema

  1. New Tables
    - `posts`
      - `id` (serial, primary key)
      - `title` (text, required)
      - `content` (text, optional)
      - `type` (enum: news, event)
      - `status` (enum: published, draft, archived)
      - `author` (text, required)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `views` (integer, default 0)
      - `featured_image` (text, optional)
      - `excerpt` (text, optional)
      - `tags` (text array, optional)
      - `event_date` (timestamptz, optional)
      - `event_location` (text, optional)

    - `products`
      - `id` (serial, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `price` (decimal, required)
      - `stock` (integer, default 0)
      - `sku` (text, unique, required)
      - `category` (text, required)
      - `status` (enum: active, inactive, out-of-stock)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `featured_image` (text, optional)
      - `images` (text array, optional)
      - `weight` (decimal, optional)
      - `dimensions` (text, optional)

    - `banners`
      - `id` (serial, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `image_url` (text, required)
      - `link_url` (text, optional)
      - `placement` (enum: header, sidebar, footer, popup)
      - `status` (enum: active, inactive, scheduled)
      - `start_date` (timestamptz, required)
      - `end_date` (timestamptz, required)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `clicks` (integer, default 0)
      - `impressions` (integer, default 0)
      - `priority` (integer, default 0)

    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, required)
      - `full_name` (text, required)
      - `role` (enum: admin, editor, viewer)
      - `status` (enum: active, inactive, pending)
      - `department` (text, optional)
      - `phone` (text, optional)
      - `avatar_url` (text, optional)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)
      - `last_login` (timestamptz, optional)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Create indexes for performance optimization

  3. Functions
    - Auto-update timestamps
    - Handle user creation from auth
*/

-- Create custom types
CREATE TYPE post_type AS ENUM ('news', 'event');
CREATE TYPE post_status AS ENUM ('published', 'draft', 'archived');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out-of-stock');
CREATE TYPE banner_placement AS ENUM ('header', 'sidebar', 'footer', 'popup');
CREATE TYPE banner_status AS ENUM ('active', 'inactive', 'scheduled');
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  type post_type NOT NULL DEFAULT 'news',
  status post_status NOT NULL DEFAULT 'draft',
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  featured_image TEXT,
  excerpt TEXT,
  tags TEXT[],
  event_date TIMESTAMPTZ,
  event_location TEXT
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  status product_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  featured_image TEXT,
  images TEXT[],
  weight DECIMAL(10,2),
  dimensions TEXT
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  placement banner_placement NOT NULL DEFAULT 'header',
  status banner_status NOT NULL DEFAULT 'inactive',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0
);

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  status user_status NOT NULL DEFAULT 'pending',
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Posts are viewable by authenticated users"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Posts can be created by editors and admins"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('editor', 'admin')
      AND users.status = 'active'
    )
  );

CREATE POLICY "Posts can be updated by editors and admins"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('editor', 'admin')
      AND users.status = 'active'
    )
  );

CREATE POLICY "Posts can be deleted by admins"
  ON posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.status = 'active'
    )
  );

-- Create policies for products
CREATE POLICY "Products are viewable by authenticated users"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Products can be managed by editors and admins"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('editor', 'admin')
      AND users.status = 'active'
    )
  );

-- Create policies for banners
CREATE POLICY "Banners are viewable by authenticated users"
  ON banners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Banners can be managed by editors and admins"
  ON banners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('editor', 'admin')
      AND users.status = 'active'
    )
  );

-- Create policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.status = 'active'
    )
  );

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.status = 'active'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);
CREATE INDEX IF NOT EXISTS idx_banners_placement ON banners(placement);
CREATE INDEX IF NOT EXISTS idx_banners_dates ON banners(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'viewer',
    'pending'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();