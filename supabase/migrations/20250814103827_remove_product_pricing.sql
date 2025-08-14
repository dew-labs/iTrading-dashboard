/*
  Update Products View Migration

  This migration updates the products_with_translations view to reflect
  the removal of the price column from the products table.
*/

-- ===============================================
-- UPDATE PRODUCTS VIEW TO REMOVE PRICE COLUMN
-- ===============================================

-- Drop the existing view first since it may depend on the price column
DROP VIEW IF EXISTS products_with_translations;

-- Recreate the view without the price column
CREATE VIEW products_with_translations AS
SELECT
    p.*,
    COALESCE(pt.name, '') as name,
    COALESCE(pt.description, '') as description,
    COALESCE(pt.language_code, 'en') as language
FROM products p
LEFT JOIN products_translations pt ON p.id = pt.product_id;