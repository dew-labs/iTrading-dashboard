/*
  # Content Translation Schema Migration

  This migration establishes the translation system for content tables including:
  - Translation tables for posts, products, and brokers
  - Indexes for performance optimization
  - RLS policies for security
  - Audit triggers for tracking changes
  - Views for easier querying with translations
*/

-- ===============================================
-- DROP EXISTING OBJECTS (IF ANY)
-- ===============================================

-- Drop views if they exist
DROP VIEW IF EXISTS posts_with_translations CASCADE;
DROP VIEW IF EXISTS products_with_translations CASCADE;
DROP VIEW IF EXISTS brokers_with_translations CASCADE;

-- Drop existing translation tables if they exist
DROP TABLE IF EXISTS posts_translations CASCADE;
DROP TABLE IF EXISTS products_translations CASCADE;
DROP TABLE IF EXISTS brokers_translations CASCADE;

-- ===============================================
-- TRANSLATION TABLES
-- ===============================================

-- Posts translations table
CREATE TABLE posts_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  language_code varchar(5) NOT NULL CHECK (language_code IN ('en', 'pt', 'vi')),
  title text NOT NULL,
  excerpt text,
  content text,
  reading_time integer DEFAULT 1 NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_post_language UNIQUE(post_id, language_code)
);

-- Products translations table
CREATE TABLE products_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  language_code varchar(5) NOT NULL CHECK (language_code IN ('en', 'pt', 'vi')),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_product_language UNIQUE(product_id, language_code)
);

-- Brokers translations table
CREATE TABLE brokers_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id uuid NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  language_code varchar(5) NOT NULL CHECK (language_code IN ('en', 'pt', 'vi')),
  description text,
  affiliate_link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_broker_language UNIQUE(broker_id, language_code)
);

-- ===============================================
-- PERFORMANCE INDEXES
-- ===============================================

-- Posts translations indexes
CREATE INDEX idx_posts_translations_post_id ON posts_translations(post_id);
CREATE INDEX idx_posts_translations_language ON posts_translations(language_code);
CREATE INDEX idx_posts_translations_reading_time ON posts_translations(reading_time);
CREATE INDEX idx_posts_translations_post_lang ON posts_translations(post_id, language_code);

-- Products translations indexes
CREATE INDEX idx_products_translations_product_id ON products_translations(product_id);
CREATE INDEX idx_products_translations_language ON products_translations(language_code);
CREATE INDEX idx_products_translations_product_lang ON products_translations(product_id, language_code);

-- Brokers translations indexes
CREATE INDEX idx_brokers_translations_broker_id ON brokers_translations(broker_id);
CREATE INDEX idx_brokers_translations_language ON brokers_translations(language_code);
CREATE INDEX idx_brokers_translations_broker_lang ON brokers_translations(broker_id, language_code);

-- ===============================================
-- UTILITY VIEWS
-- ===============================================

-- Posts with translations view
CREATE VIEW posts_with_translations AS
SELECT
  p.*,
  json_agg(
    json_build_object(
      'id', pt.id,
      'language_code', pt.language_code,
      'title', pt.title,
      'excerpt', pt.excerpt,
      'content', pt.content,
      'reading_time', pt.reading_time,
      'created_at', pt.created_at,
      'updated_at', pt.updated_at
    ) ORDER BY pt.language_code
  ) FILTER (WHERE pt.id IS NOT NULL) as translations
FROM posts p
LEFT JOIN posts_translations pt ON p.id = pt.post_id
GROUP BY p.id, p.author_id, p.type, p.status, p.views, p.published_at, p.created_at, p.updated_at;

-- Products with translations view
CREATE VIEW products_with_translations AS
SELECT
  p.id,
  p.affiliate_link,
  p.created_at,
  p.updated_at,
  json_agg(
    json_build_object(
      'id', pt.id,
      'language_code', pt.language_code,
      'name', pt.name,
      'description', pt.description,
      'created_at', pt.created_at,
      'updated_at', pt.updated_at
    ) ORDER BY pt.language_code
  ) FILTER (WHERE pt.id IS NOT NULL) as translations
FROM products p
LEFT JOIN products_translations pt ON p.id = pt.product_id
GROUP BY p.id, p.affiliate_link, p.created_at, p.updated_at;

-- Brokers with translations view
CREATE VIEW brokers_with_translations AS
SELECT
  b.*,
  json_agg(
    json_build_object(
      'id', bt.id,
      'language_code', bt.language_code,
      'description', bt.description,
      'affiliate_link', bt.affiliate_link,
      'created_at', bt.created_at,
      'updated_at', bt.updated_at
    ) ORDER BY bt.language_code
  ) FILTER (WHERE bt.id IS NOT NULL) as translations
FROM brokers b
LEFT JOIN brokers_translations bt ON b.id = bt.broker_id
GROUP BY b.id, b.is_visible, b.name, b.headquarter, b.established_in, b.category_id, b.created_at, b.updated_at;

-- ===============================================
-- SECURITY INVOKER FOR TRANSLATION VIEWS
-- ===============================================

-- Set security_invoker for all translation views to respect RLS policies
ALTER VIEW public.posts_with_translations SET (security_invoker = on);
ALTER VIEW public.products_with_translations SET (security_invoker = on);
ALTER VIEW public.brokers_with_translations SET (security_invoker = on);

-- ===============================================
-- ENABLE ROW LEVEL SECURITY
-- ===============================================

-- Enable RLS on translation tables
ALTER TABLE posts_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers_translations ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- RLS POLICIES
-- ===============================================

-- Posts translations policies
CREATE POLICY "Posts translations are viewable by everyone"
  ON posts_translations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Moderators and admins can insert posts translations"
  ON posts_translations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Moderators and admins can update posts translations"
  ON posts_translations FOR UPDATE
  TO authenticated
  USING (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Moderators and admins can delete posts translations"
  ON posts_translations FOR DELETE
  TO authenticated
  USING (public.is_moderator_or_admin(auth.uid()));

-- Products translations policies
CREATE POLICY "Products translations are viewable by everyone"
  ON products_translations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Moderators and admins can insert products translations"
  ON products_translations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Moderators and admins can update products translations"
  ON products_translations FOR UPDATE
  TO authenticated
  USING (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Moderators and admins can delete products translations"
  ON products_translations FOR DELETE
  TO authenticated
  USING (public.is_moderator_or_admin(auth.uid()));

-- Brokers translations policies
CREATE POLICY "Brokers translations are viewable by everyone"
  ON brokers_translations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Moderators and admins can insert brokers translations"
  ON brokers_translations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Moderators and admins can update brokers translations"
  ON brokers_translations FOR UPDATE
  TO authenticated
  USING (public.is_moderator_or_admin(auth.uid()));

CREATE POLICY "Moderators and admins can delete brokers translations"
  ON brokers_translations FOR DELETE
  TO authenticated
  USING (public.is_moderator_or_admin(auth.uid()));

-- ===============================================
-- AUDIT TRIGGERS
-- ===============================================

-- Add audit triggers for translation tables
CREATE TRIGGER audit_posts_translations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON posts_translations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_products_translations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products_translations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_brokers_translations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON brokers_translations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ===============================================
-- HELPER FUNCTIONS
-- ===============================================

-- Function to get translated content for a specific language
CREATE OR REPLACE FUNCTION get_translated_content(
  content_type text,
  content_id uuid,
  language_code text DEFAULT 'en',
  fallback_language text DEFAULT 'en'
) RETURNS jsonb AS $$
DECLARE
  result jsonb;
  table_name text;
  id_column text;
BEGIN
  -- Determine table and column names based on content type
  CASE content_type
    WHEN 'posts' THEN
      table_name := 'public.posts_translations';
      id_column := 'post_id';
    WHEN 'products' THEN
      table_name := 'public.products_translations';
      id_column := 'product_id';
    WHEN 'brokers' THEN
      table_name := 'public.brokers_translations';
      id_column := 'broker_id';
    ELSE
      RAISE EXCEPTION 'Invalid content type: %', content_type;
  END CASE;

  -- Try to get translation in requested language
  EXECUTE format('
    SELECT row_to_json(t.*)
    FROM %s t
    WHERE %I = $1 AND language_code = $2
  ', table_name, id_column)
  INTO result
  USING content_id, language_code;

  -- If not found and different from fallback, try fallback language
  IF result IS NULL AND language_code != fallback_language THEN
    EXECUTE format('
      SELECT row_to_json(t.*)
      FROM %s t
      WHERE %I = $1 AND language_code = $2
    ', table_name, id_column)
    INTO result
    USING content_id, fallback_language;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to check if content has translation for specific language
CREATE OR REPLACE FUNCTION has_translation(
  content_type text,
  content_id uuid,
  language_code text
) RETURNS boolean AS $$
DECLARE
  table_name text;
  id_column text;
  exists_flag boolean;
BEGIN
  -- Determine table and column names based on content type
  CASE content_type
    WHEN 'posts' THEN
      table_name := 'public.posts_translations';
      id_column := 'post_id';
    WHEN 'products' THEN
      table_name := 'public.products_translations';
      id_column := 'product_id';
    WHEN 'brokers' THEN
      table_name := 'public.brokers_translations';
      id_column := 'broker_id';
    ELSE
      RAISE EXCEPTION 'Invalid content type: %', content_type;
  END CASE;

  -- Check if translation exists
  EXECUTE format('
    SELECT EXISTS(
      SELECT 1 FROM %s
      WHERE %I = $1 AND language_code = $2
    )
  ', table_name, id_column)
  INTO exists_flag
  USING content_id, language_code;

  RETURN exists_flag;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_translated_content(text, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION has_translation(text, uuid, text) TO authenticated;

-- ===============================================
-- COLUMN COMMENTS
-- ===============================================

-- Add comment for the reading_time column
COMMENT ON COLUMN posts_translations.reading_time IS 'Estimated reading time in minutes for this language version';

-- ===============================================
-- INITIAL DATA MIGRATION
-- ===============================================

-- Note: Data migration removed since translatable fields are no longer in main tables.
-- In a production environment with existing data, you would need to:
-- 1. First add translation tables
-- 2. Migrate existing data to translation tables
-- 3. Then remove fields from main tables in a separate migration

-- For fresh installations, translation data will be inserted directly into translation tables.

-- ===============================================
-- TABLE COMMENTS
-- ===============================================

COMMENT ON TABLE posts_translations IS 'Translation table for posts content in multiple languages';
COMMENT ON TABLE products_translations IS 'Translation table for products content in multiple languages';
COMMENT ON TABLE brokers_translations IS 'Translation table for brokers content in multiple languages';

-- Column comments
COMMENT ON COLUMN posts_translations.language_code IS 'Language code (en, pt, vi) for the translation';
COMMENT ON COLUMN posts_translations.title IS 'Translated title of the post';
COMMENT ON COLUMN posts_translations.excerpt IS 'Translated excerpt/summary of the post';
COMMENT ON COLUMN posts_translations.content IS 'Translated full content of the post';

COMMENT ON COLUMN products_translations.language_code IS 'Language code (en, pt, vi) for the translation';
COMMENT ON COLUMN products_translations.name IS 'Translated name of the product';
COMMENT ON COLUMN products_translations.description IS 'Translated description of the product';

COMMENT ON COLUMN brokers_translations.language_code IS 'Language code (en, pt, vi) for the translation';
COMMENT ON COLUMN brokers_translations.description IS 'Translated description of the broker';
COMMENT ON COLUMN brokers_translations.affiliate_link IS 'Language-specific affiliate link URL for the broker';

-- ===============================================
-- VERIFICATION & LOGGING
-- ===============================================

DO $$
DECLARE
  posts_count int;
  products_count int;
  brokers_count int;
BEGIN
  -- Count migrated translations
  SELECT COUNT(*) INTO posts_count FROM posts_translations;
  SELECT COUNT(*) INTO products_count FROM products_translations;
  SELECT COUNT(*) INTO brokers_count FROM brokers_translations;

  RAISE NOTICE '✅ Translation tables created successfully';
  RAISE NOTICE '📊 Migrated % posts translations', posts_count;
  RAISE NOTICE '📊 Migrated % products translations', products_count;
  RAISE NOTICE '📊 Migrated % brokers translations', brokers_count;
  RAISE NOTICE '🔒 RLS policies configured for all translation tables';
  RAISE NOTICE '🔍 Views created for easy querying with translations';
  RAISE NOTICE '🛡️ Audit triggers enabled for translation tables';
  RAISE NOTICE '⚡ Performance indexes created';
  RAISE NOTICE '🔧 Helper functions created and permissions granted';

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Error during translation schema setup: % - %', SQLSTATE, SQLERRM;
END $$;
