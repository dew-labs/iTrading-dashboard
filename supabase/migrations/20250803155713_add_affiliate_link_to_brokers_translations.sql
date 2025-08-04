/*
  # Add Affiliate Link to Brokers Translations

  This migration adds the affiliate_link column to the brokers_translations table
  to support language-specific affiliate links for brokers.
*/

-- ===============================================
-- ADD AFFILIATE LINK COLUMN
-- ===============================================

-- Add affiliate_link column to brokers_translations table
ALTER TABLE brokers_translations 
ADD COLUMN affiliate_link text;

-- ===============================================
-- UPDATE BROKERS WITH TRANSLATIONS VIEW
-- ===============================================

-- Drop and recreate the brokers_with_translations view to include affiliate_link
DROP VIEW IF EXISTS brokers_with_translations CASCADE;

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
GROUP BY b.id, b.is_visible, b.name, b.headquarter, b.established_in, b.created_at, b.updated_at;

-- ===============================================
-- SECURITY INVOKER FOR UPDATED VIEW
-- ===============================================

-- Set security_invoker for the updated view to respect RLS policies
ALTER VIEW public.brokers_with_translations SET (security_invoker = on);

-- ===============================================
-- COLUMN COMMENTS
-- ===============================================

COMMENT ON COLUMN brokers_translations.affiliate_link IS 'Language-specific affiliate link URL for the broker';

-- ===============================================
-- VERIFICATION & LOGGING
-- ===============================================

DO $$
BEGIN
  RAISE NOTICE '✅ affiliate_link column added to brokers_translations table';
  RAISE NOTICE '🔍 brokers_with_translations view updated to include affiliate_link';
  RAISE NOTICE '🔒 Security invoker set for updated view';
  RAISE NOTICE '📝 Column comments added';

EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Error during affiliate_link migration: % - %', SQLSTATE, SQLERRM;
END $$;