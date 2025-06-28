-- Add name field to banners table
ALTER TABLE banners ADD COLUMN name TEXT NOT NULL DEFAULT 'Untitled Banner';

-- Update existing banners to have meaningful names based on their target URLs
UPDATE banners
SET name = CASE
  WHEN target_url IS NOT NULL AND target_url != '' THEN
    CONCAT('Banner for ',
      COALESCE(
        NULLIF(REGEXP_REPLACE(target_url, '^https?://(www\.)?([^/]+).*', '\2'), ''),
        'Website'
      )
    )
  ELSE
    CONCAT('Banner #', LEFT(id::text, 8))
END;

-- Remove the default constraint after updating existing records
ALTER TABLE banners ALTER COLUMN name DROP DEFAULT;
