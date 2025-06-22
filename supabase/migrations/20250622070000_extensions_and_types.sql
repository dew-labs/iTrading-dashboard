/*
  # Extensions and Custom Types Migration

  This migration sets up the foundational extensions and custom types needed for the database.
*/

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
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE user_status AS ENUM ('invited', 'active', 'inactive', 'suspended');
