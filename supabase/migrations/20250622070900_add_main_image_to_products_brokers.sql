/*
  # Add Featured Image and Logo Fields to Products and Brokers

  This migration adds featured_image_url to products and logo_url to brokers tables
  to support dedicated display images separate from description images.
*/

-- Add featured_image_url column to products table
ALTER TABLE products
ADD COLUMN featured_image_url text;

-- Add logo_url column to brokers table
ALTER TABLE brokers
ADD COLUMN logo_url text;

-- Add comments for documentation
COMMENT ON COLUMN products.featured_image_url IS 'URL of the featured product image for display and listings';
COMMENT ON COLUMN brokers.logo_url IS 'URL of the broker logo/brand image for display and listings';
