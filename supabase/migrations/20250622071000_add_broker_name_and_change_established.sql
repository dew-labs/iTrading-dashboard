/*
  # Add Broker Name and Change Established Field

  This migration adds a name field to brokers table and changes established_at
  to established_in to store year instead of full date.
*/

-- Add name column to brokers table
ALTER TABLE brokers
ADD COLUMN name varchar NOT NULL DEFAULT '';

-- Drop the old established_at column
ALTER TABLE brokers
DROP COLUMN established_at;

-- Add new established_in column for year
ALTER TABLE brokers
ADD COLUMN established_in integer;

-- Add comments for documentation
COMMENT ON COLUMN brokers.name IS 'Name of the broker company';
COMMENT ON COLUMN brokers.established_in IS 'Year the broker was established (e.g., 1999, 2010)';
