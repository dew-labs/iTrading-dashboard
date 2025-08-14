/*
  # Referral System Migration

  This migration adds the referral system functionality including:
  - Adding 'affiliate' to user_role enum
  - Creating user_referral_codes table
  - Creating user_referrals table
  - Setting up RLS policies for affiliate access
*/

-- ===============================================
-- CREATE REFERRAL TABLES
-- ===============================================

-- User referral codes table
CREATE TABLE user_referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code varchar(20) NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Referral relationships table
CREATE TABLE user_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code varchar(20) NOT NULL,
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  referred_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,

  -- Prevent self-referral and duplicate referrals
  CONSTRAINT no_self_referral CHECK (referrer_id != referred_user_id),
  CONSTRAINT unique_referred_user UNIQUE(referred_user_id)
);

-- ===============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for user_referral_codes
CREATE INDEX idx_user_referral_codes_user_id ON user_referral_codes(user_id);
CREATE INDEX idx_user_referral_codes_code ON user_referral_codes(referral_code);
CREATE INDEX idx_user_referral_codes_active ON user_referral_codes(is_active) WHERE is_active = true;

-- Indexes for user_referrals
CREATE INDEX idx_user_referrals_referrer_id ON user_referrals(referrer_id);
CREATE INDEX idx_user_referrals_referred_user_id ON user_referrals(referred_user_id);
CREATE INDEX idx_user_referrals_code ON user_referrals(referral_code);
CREATE INDEX idx_user_referrals_status ON user_referrals(status);

-- ===============================================
-- ENABLE ROW LEVEL SECURITY
-- ===============================================

-- Enable RLS on new tables
ALTER TABLE user_referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- RLS POLICIES FOR user_referral_codes
-- ===============================================

-- Admins can see all referral codes
CREATE POLICY "Admins can view all referral codes" ON user_referral_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Moderators can see all referral codes
CREATE POLICY "Moderators can view all referral codes" ON user_referral_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
  );

-- Affiliates can only see their own referral codes
CREATE POLICY "Affiliates can view own referral codes" ON user_referral_codes
  FOR SELECT USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'affiliate'
    )
  );

-- Affiliates can insert their own referral codes
CREATE POLICY "Affiliates can create own referral codes" ON user_referral_codes
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'affiliate'
    )
  );

-- Affiliates can update their own referral codes
CREATE POLICY "Affiliates can update own referral codes" ON user_referral_codes
  FOR UPDATE USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'affiliate'
    )
  );

-- Admins can manage all referral codes
CREATE POLICY "Admins can manage all referral codes" ON user_referral_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ===============================================
-- RLS POLICIES FOR user_referrals
-- ===============================================

-- Admins can see all referrals
CREATE POLICY "Admins can view all referrals" ON user_referrals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Moderators can see all referrals
CREATE POLICY "Moderators can view all referrals" ON user_referrals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
  );

-- Affiliates can only see referrals where they are the referrer
CREATE POLICY "Affiliates can view own referrals" ON user_referrals
  FOR SELECT USING (
    referrer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'affiliate'
    )
  );

-- Users can see their own referral record (who referred them)
CREATE POLICY "Users can view own referral record" ON user_referrals
  FOR SELECT USING (
    referred_user_id = auth.uid()
  );

-- System can insert referrals (typically done via backend/API)
CREATE POLICY "System can create referrals" ON user_referrals
  FOR INSERT WITH CHECK (true);

-- Admins can manage all referrals
CREATE POLICY "Admins can manage all referrals" ON user_referrals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Moderators can update referral status
CREATE POLICY "Moderators can update referrals" ON user_referrals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'moderator'
    )
  );

-- ===============================================
-- TABLE COMMENTS
-- ===============================================

COMMENT ON TABLE user_referral_codes IS 'Stores referral codes generated by affiliate users';
COMMENT ON TABLE user_referrals IS 'Tracks referral relationships between users';

-- Column comments
COMMENT ON COLUMN user_referral_codes.referral_code IS 'Unique referral code (e.g., REF123AB)';
COMMENT ON COLUMN user_referral_codes.is_active IS 'Whether this referral code is currently active and can be used';
COMMENT ON COLUMN user_referrals.status IS 'Status of the referral: pending, confirmed, or rejected';
COMMENT ON COLUMN user_referrals.referred_at IS 'When the referral was initially created (user signed up with code)';
COMMENT ON COLUMN user_referrals.confirmed_at IS 'When the referral was confirmed (user became active/completed requirements)';

-- ===============================================
-- FUNCTIONS FOR REFERRAL CODE GENERATION
-- ===============================================

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS varchar(20) AS $$
DECLARE
  code varchar(20);
  attempts integer := 0;
  max_attempts integer := 100;
BEGIN
  LOOP
    -- Generate a code: REF + 6 random alphanumeric characters
    code := 'REF' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

    -- Check if code already exists
    IF NOT EXISTS (SELECT 1 FROM user_referral_codes WHERE referral_code = code) THEN
      RETURN code;
    END IF;

    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Unable to generate unique referral code after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create a referral code for a user
CREATE OR REPLACE FUNCTION create_user_referral_code(user_uuid uuid)
RETURNS varchar(20) AS $$
DECLARE
  new_code varchar(20);
BEGIN
  -- Check if user is an affiliate
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = user_uuid
    AND role = 'affiliate'
  ) THEN
    RAISE EXCEPTION 'Only affiliate users can have referral codes';
  END IF;

  -- Check if user already has an active referral code
  SELECT referral_code INTO new_code
  FROM user_referral_codes
  WHERE user_id = user_uuid
  AND is_active = true
  LIMIT 1;

  IF new_code IS NOT NULL THEN
    RETURN new_code;
  END IF;

  -- Generate new code
  new_code := generate_referral_code();

  -- Insert the new referral code
  INSERT INTO user_referral_codes (user_id, referral_code)
  VALUES (user_uuid, new_code);

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and create a referral relationship
CREATE OR REPLACE FUNCTION create_referral_relationship(
  referred_user_uuid uuid,
  referral_code_input varchar(20)
)
RETURNS boolean AS $$
DECLARE
  referrer_uuid uuid;
BEGIN
  -- Find the referrer by the referral code
  SELECT user_id INTO referrer_uuid
  FROM user_referral_codes
  WHERE referral_code = referral_code_input
  AND is_active = true;

  -- If no valid referral code found
  IF referrer_uuid IS NULL THEN
    RETURN false;
  END IF;

  -- Prevent self-referral
  IF referrer_uuid = referred_user_uuid THEN
    RETURN false;
  END IF;

  -- Check if user is already referred by someone
  IF EXISTS (
    SELECT 1 FROM user_referrals
    WHERE referred_user_id = referred_user_uuid
  ) THEN
    RETURN false;
  END IF;

  -- Create the referral relationship
  INSERT INTO user_referrals (
    referrer_id,
    referred_user_id,
    referral_code,
    status
  ) VALUES (
    referrer_uuid,
    referred_user_uuid,
    referral_code_input,
    'pending'
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql;
