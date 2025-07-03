-- Migration: Add blurhash to images table
ALTER TABLE images ADD COLUMN blurhash text;

COMMENT ON COLUMN images.blurhash IS 'Blurhash string for low-res image placeholder.';
