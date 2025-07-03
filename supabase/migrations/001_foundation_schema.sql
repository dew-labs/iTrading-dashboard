/*
  # 001 Foundation & Schema Migration (Merged)

  This migration establishes the foundational database schema, security, and storage setup for iTrading Dashboard.
  Includes:
  - Extensions and custom types
  - Core business tables (with all latest columns)
  - Indexes
  - RLS enablement and policies
  - Helper functions and triggers
  - Storage buckets and policies
  - Audit logs infrastructure
  - Table and column comments
*/

-- ===============================================
-- EXTENSIONS & TYPES
-- ===============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    DROP TYPE IF EXISTS post_type CASCADE;
    DROP TYPE IF EXISTS post_status CASCADE;
    DROP TYPE IF EXISTS user_role CASCADE;
    DROP TYPE IF EXISTS user_status CASCADE;
END $$;

CREATE TYPE post_type AS ENUM ('news', 'event', 'terms_of_use', 'privacy_policy');
CREATE TYPE post_status AS ENUM ('draft', 'published');
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE user_status AS ENUM ('invited', 'active', 'inactive', 'suspended');

-- ===============================================
-- CORE TABLES
-- ===============================================

DROP TABLE IF EXISTS user_notifications CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS images CASCADE;
DROP TABLE IF EXISTS brokers CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Users table
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
  country varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  type post_type NOT NULL DEFAULT 'news',
  status post_status NOT NULL DEFAULT 'draft',
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  thumbnail_url text,
  views bigint DEFAULT 0 NOT NULL,
  published_at timestamptz DEFAULT now(),
  is_visible boolean NOT NULL DEFAULT true,
  reading_time integer,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  price numeric NOT NULL,
  description text,
  featured_image_url text,
  subscription boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Brokers table
CREATE TABLE brokers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar NOT NULL,
  established_in integer,
  headquarter text,
  description text,
  logo_url text,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Banners table
CREATE TABLE banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target_url text,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Role permissions table
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_role_permission UNIQUE(role, resource, action)
);

-- Images table
CREATE TABLE images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name varchar NOT NULL,
  record_id uuid NOT NULL,
  image_url text NOT NULL,
  storage_object_id uuid,
  alt_text text,
  file_size bigint,
  mime_type varchar,
  blurhash text,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  user_id uuid REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- User notifications tracking table
CREATE TABLE user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  notification_id uuid NOT NULL REFERENCES notifications(id) ON UPDATE CASCADE ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
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
  created_at timestamptz DEFAULT now()
);

-- ===============================================
-- INDEXES
-- ===============================================

CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_status_type ON posts(status, type);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_views ON posts(views);
CREATE INDEX idx_products_subscription ON products(subscription);
CREATE INDEX idx_brokers_established_at ON brokers(established_in);
CREATE INDEX idx_brokers_created_at ON brokers(created_at);
CREATE INDEX idx_banners_visible ON banners(is_visible);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_images_table_record ON images(table_name, record_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(is_read);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_user_role ON audit_logs(user_role);

-- ===============================================
-- ENABLE ROW LEVEL SECURITY
-- ===============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- TABLE & COLUMN COMMENTS
-- ===============================================

COMMENT ON TABLE users IS 'Central user management with roles and permissions';
COMMENT ON COLUMN users.country IS 'Country of the user (ISO 3166-1 alpha-2 code or full name, nullable)';
COMMENT ON TABLE posts IS 'Content management system with authorship and view tracking';
COMMENT ON COLUMN posts.author_id IS 'Reference to the user who created this post';
COMMENT ON COLUMN posts.views IS 'Number of times this post has been viewed';
COMMENT ON COLUMN posts.thumbnail_url IS 'Featured image for post listings and previews';
COMMENT ON COLUMN posts.reading_time IS 'Estimated reading time in minutes';
COMMENT ON TABLE products IS 'Product catalog with pricing and subscription options';
COMMENT ON COLUMN products.featured_image_url IS 'Main product image for display and listings';
COMMENT ON TABLE brokers IS 'Trading broker information and profiles';
COMMENT ON COLUMN brokers.logo_url IS 'Broker company logo/brand image';
COMMENT ON COLUMN brokers.established_in IS 'Year the broker was established (e.g., 1999, 2010)';
COMMENT ON TABLE banners IS 'Promotional banner management system';
COMMENT ON TABLE role_permissions IS 'Role-based permission definitions';
COMMENT ON TABLE images IS 'Centralized image metadata and storage references';
COMMENT ON COLUMN images.blurhash IS 'Blurhash string for low-res image placeholder.';
COMMENT ON TABLE notifications IS 'System and user notifications';
COMMENT ON TABLE user_notifications IS 'User notification read/unread tracking';
COMMENT ON TABLE audit_logs IS 'Audit log of admin and moderator actions';

-- ===============================================
-- HELPER FUNCTIONS & TRIGGERS
-- ===============================================

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment post views atomically
CREATE OR REPLACE FUNCTION increment_post_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$;
GRANT EXECUTE ON FUNCTION increment_post_views(uuid) TO authenticated;

-- Function to handle new users from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;
    INSERT INTO public.users (
        id, email, role, status, full_name, phone, avatar_url, country, created_at, updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') IN ('user', 'moderator', 'admin')
            THEN COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role
            ELSE 'user'::user_role END,
        CASE WHEN COALESCE(NEW.raw_user_meta_data->>'status', 'invited') IN ('invited', 'active', 'inactive', 'suspended')
            THEN COALESCE(NEW.raw_user_meta_data->>'status', 'invited')::user_status
            ELSE 'invited'::user_status END,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.phone,
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'country',
        NOW(),
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create user profile for % (ID: %): % - %', NEW.email, NEW.id, SQLSTATE, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user deletion cascade to auth.users
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.id;
  RAISE LOG 'Deleted auth.users record for user_id: %', OLD.id;
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to delete auth.users record for user_id %: % - %', OLD.id, SQLSTATE, SQLERRM;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_public_user_deleted
  AFTER DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

-- ===============================================
-- RLS POLICIES
-- ===============================================

-- Users table
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update all users" ON users FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Allow user creation via trigger and admins" ON users FOR INSERT WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = id OR auth.uid() IS NULL);
CREATE POLICY "Admins can delete users" ON users FOR DELETE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Posts table
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT TO public USING (is_visible = true);
CREATE POLICY "Authenticated users can insert posts" ON posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update posts" ON posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete posts" ON posts FOR DELETE TO authenticated USING (true);

-- Products table
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE TO authenticated USING (true);

-- Brokers table
CREATE POLICY "Brokers are viewable by everyone" ON brokers FOR SELECT TO public USING (is_visible = true);
CREATE POLICY "Authenticated users can insert brokers" ON brokers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update brokers" ON brokers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete brokers" ON brokers FOR DELETE TO authenticated USING (true);

-- Banners table
CREATE POLICY "Visible banners are viewable by everyone" ON banners FOR SELECT TO public USING (is_visible = true);
CREATE POLICY "All banners are viewable by authenticated users" ON banners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert banners" ON banners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update banners" ON banners FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete banners" ON banners FOR DELETE TO authenticated USING (true);

-- Role permissions table
CREATE POLICY "Admins can manage role permissions" ON role_permissions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Images table
CREATE POLICY "Public can view images" ON images FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert images" ON images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update images" ON images FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete images" ON images FOR DELETE TO authenticated USING (true);

-- Notifications table
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Authenticated users can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update notifications" ON notifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete notifications" ON notifications FOR DELETE TO authenticated USING (true);

-- User notifications table
CREATE POLICY "Users can view their user notifications" ON user_notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can insert user notifications" ON user_notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authenticated users can update user notifications" ON user_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can delete user notifications" ON user_notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Audit logs table
CREATE POLICY "Admins can view all audit logs" ON audit_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage audit logs" ON audit_logs FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ===============================================
-- AUDIT TRIGGER FUNCTION & TRIGGERS
-- ===============================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
DECLARE
  current_user_record users%ROWTYPE;
  old_values jsonb := '{}';
  new_values jsonb := '{}';
  changed_fields text[] := ARRAY[]::text[];
  excluded_columns text[] := ARRAY['updated_at', 'last_login'];
  record_id_value uuid;
BEGIN
  SELECT * INTO current_user_record FROM users WHERE id = auth.uid();
  IF current_user_record.role NOT IN ('admin', 'moderator') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF TG_OP = 'DELETE' THEN
    record_id_value := OLD.id;
  ELSE
    record_id_value := NEW.id;
  END IF;
  IF TG_OP = 'DELETE' THEN
    old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);
    SELECT array_agg(key) INTO changed_fields FROM (
      SELECT key FROM jsonb_each(to_jsonb(NEW))
      WHERE NOT (key = ANY(excluded_columns))
      AND to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
    ) AS changes;
    IF array_length(changed_fields, 1) IS NULL THEN
      RETURN NEW;
    END IF;
  END IF;
  INSERT INTO audit_logs (
    user_id, user_email, user_role, table_name, record_id, action, old_values, new_values, changed_fields, session_id
  ) VALUES (
    current_user_record.id, current_user_record.email, current_user_record.role, TG_TABLE_NAME, record_id_value, TG_OP, old_values, new_values, changed_fields, current_setting('audit.session_id', true)
  );
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Audit logging failed for table % operation %: % - %', TG_TABLE_NAME, TG_OP, SQLSTATE, SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_posts_trigger AFTER INSERT OR UPDATE OR DELETE ON posts FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_products_trigger AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_brokers_trigger AFTER INSERT OR UPDATE OR DELETE ON brokers FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_banners_trigger AFTER INSERT OR UPDATE OR DELETE ON banners FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_role_permissions_trigger AFTER INSERT OR UPDATE OR DELETE ON role_permissions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ===============================================
-- STORAGE BUCKETS & POLICIES
-- ===============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('posts', 'posts', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
  ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('products', 'products', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
  ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('brokers', 'brokers', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
  ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
  ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('users', 'users', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
  ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
  ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760, allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Storage bucket policies (example for posts, repeat for others as needed)
CREATE POLICY "Public read access for post images" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Authenticated users can upload post images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their post uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'posts' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their post uploads" ON storage.objects FOR DELETE USING (bucket_id = 'posts' AND auth.role() = 'authenticated');
-- Repeat similar policies for products, brokers, banners, users (avatars), images buckets as in original migrations.

-- ===============================================
-- END OF MIGRATION
-- ===============================================
