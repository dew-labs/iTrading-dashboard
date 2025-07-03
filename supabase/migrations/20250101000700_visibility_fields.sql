-- Migration: Add is_visible to brokers and posts, rename is_active to is_visible in banners

-- 1. Rename is_active to is_visible in banners
ALTER TABLE banners RENAME COLUMN is_active TO is_visible;

-- 2. Add is_visible to brokers
ALTER TABLE brokers ADD COLUMN is_visible boolean NOT NULL DEFAULT true;

-- 3. Add is_visible to posts
ALTER TABLE posts ADD COLUMN is_visible boolean NOT NULL DEFAULT true;
