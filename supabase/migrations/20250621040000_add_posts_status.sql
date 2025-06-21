/*
  # Add status field to posts table

  1. Changes
    - Add post_status enum type with 'draft' and 'published' values
    - Add status column to posts table with default 'draft'
    - Update existing posts to have 'published' status if published_at is set, otherwise 'draft'

  2. Migration Strategy
    - Create new enum type
    - Add column with default value
    - Update existing data based on published_at field
    - Remove published_at field dependency (keep it for backwards compatibility)
*/

-- Create post status enum type
CREATE TYPE post_status AS ENUM ('draft', 'published');

-- Add status column to posts table
ALTER TABLE posts
ADD COLUMN status post_status NOT NULL DEFAULT 'draft';

-- Update existing posts: set status to 'published' if published_at is not null, otherwise 'draft'
UPDATE posts
SET status = CASE
  WHEN published_at IS NOT NULL THEN 'published'::post_status
  ELSE 'draft'::post_status
END;

-- Add index for better query performance on status
CREATE INDEX idx_posts_status ON posts(status);

-- Add index for common queries (status + type)
CREATE INDEX idx_posts_status_type ON posts(status, type);
