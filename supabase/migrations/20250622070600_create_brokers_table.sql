/*
  # Create Brokers Table Migration

  This migration creates the brokers table for managing broker information.
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS brokers CASCADE;

-- Create brokers table
CREATE TABLE brokers (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  established_at date,
  headquarter text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brokers (public read, authenticated write)
CREATE POLICY "Brokers are viewable by everyone"
  ON brokers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert brokers"
  ON brokers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update brokers"
  ON brokers FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete brokers"
  ON brokers FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_brokers_established_at ON brokers(established_at);
CREATE INDEX idx_brokers_created_at ON brokers(created_at);
