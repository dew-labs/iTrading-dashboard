/*
  Remove Product Pricing Migration
  
  This migration removes the price column from the products table
  as pricing is no longer required for product management.
*/

-- ===============================================
-- REMOVE PRICE COLUMN FROM PRODUCTS TABLE
-- ===============================================

-- Remove the price column from products table
ALTER TABLE products DROP COLUMN IF EXISTS price;

-- Update the table comment to reflect that pricing was removed
COMMENT ON TABLE products IS 'Product catalog with affiliate links and translations';

-- Remove the pricing-related comment
COMMENT ON COLUMN products.affiliate_link IS 'Affiliate link for the product (external or internal URL)';