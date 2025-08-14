/*
  # Add Affiliate Role Migration

  This migration adds the 'affiliate' role to the user_role enum.
  This needs to be done in a separate transaction from where it's used.
*/

-- ===============================================
-- UPDATE USER ROLE ENUM
-- ===============================================

-- Add 'affiliate' to the existing user_role enum
ALTER TYPE user_role ADD VALUE 'affiliate';
