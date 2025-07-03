/*
  # Permissions & Security Migration

  This migration establishes the security framework including:
  - Helper functions and triggers
  - Row Level Security policies
  - Admin user creation
  - User management functions
*/

-- ===============================================
-- HELPER FUNCTIONS
-- ===============================================

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment post views atomically
CREATE OR REPLACE FUNCTION increment_post_views(post_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_post_views(bigint) TO authenticated;

-- ===============================================
-- USER MANAGEMENT TRIGGERS
-- ===============================================

-- Function to handle new users from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Check if user already exists to avoid duplicates
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Insert new user with proper defaults
    INSERT INTO public.users (
        id,
        email,
        role,
        status,
        full_name,
        phone,
        avatar_url,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        CASE
            WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') IN ('user', 'moderator', 'admin')
            THEN COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role
            ELSE 'user'::user_role
        END,
        CASE
            WHEN COALESCE(NEW.raw_user_meta_data->>'status', 'invited') IN ('invited', 'active', 'inactive', 'suspended')
            THEN COALESCE(NEW.raw_user_meta_data->>'status', 'invited')::user_status
            ELSE 'invited'::user_status
        END,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.phone,
        NEW.raw_user_meta_data->>'avatar_url',
        NOW(),
        NOW()
    );

    RETURN NEW;

EXCEPTION
    WHEN OTHERS THEN
        -- Don't fail the auth process, just log the error
        RAISE WARNING 'Failed to create user profile for % (ID: %): % - %', NEW.email, NEW.id, SQLSTATE, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user deletion cascade to auth.users
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete the corresponding auth.users record
  DELETE FROM auth.users WHERE id = OLD.id;

  -- Log the deletion for audit purposes
  RAISE LOG 'Deleted auth.users record for user_id: %', OLD.id;

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the public.users deletion
    RAISE WARNING 'Failed to delete auth.users record for user_id %: % - %', OLD.id, SQLSTATE, SQLERRM;
    RETURN OLD;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_public_user_deleted
  AFTER DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();

-- ===============================================
-- ROW LEVEL SECURITY POLICIES
-- ===============================================

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow user creation via trigger and admins"
  ON users FOR INSERT
  WITH CHECK (
    public.is_admin(auth.uid())
    OR auth.uid() = id
    OR auth.uid() IS NULL
  );

CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Posts table policies
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (true);

-- Products table policies
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Brokers table policies
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

-- Banners table policies
CREATE POLICY "Active banners are viewable by everyone"
  ON banners FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "All banners are viewable by authenticated users"
  ON banners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert banners"
  ON banners FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update banners"
  ON banners FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete banners"
  ON banners FOR DELETE
  TO authenticated
  USING (true);

-- User permissions table policies
CREATE POLICY "Users can view own permissions"
  ON user_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions"
  ON user_permissions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage permissions"
  ON user_permissions FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Role permissions table policies
CREATE POLICY "Everyone can view role permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage role permissions"
  ON role_permissions FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Images table policies
CREATE POLICY "Images are viewable by everyone"
  ON images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert images"
  ON images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update images"
  ON images FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete images"
  ON images FOR DELETE
  TO authenticated
  USING (true);

-- Notifications table policies
CREATE POLICY "Users can view their notifications and system notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (true);

-- User notifications table policies
CREATE POLICY "Users can view own notification status"
  ON user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification status"
  ON user_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification status"
  ON user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification status"
  ON user_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===============================================
-- ADMIN USER CREATION
-- ===============================================

-- Create a confirmed admin user directly
DO $$
DECLARE
  admin_email text := 'admin@admin.com';
  admin_password text := '123123123';
  admin_user_id uuid;
  encrypted_password text;
  existing_user_id uuid;
BEGIN
  -- Check if user already exists in auth.users
  SELECT id INTO existing_user_id FROM auth.users WHERE email = admin_email;

  IF existing_user_id IS NOT NULL THEN
    -- User exists, use existing ID
    admin_user_id := existing_user_id;
    RAISE NOTICE 'ℹ️  Admin user already exists, updating...';

    -- Update existing user
    UPDATE auth.users
    SET
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      email_confirmed_at = now(),
      confirmation_token = '',
      updated_at = now()
    WHERE id = admin_user_id;
  ELSE
    -- User doesn't exist, create new one
    admin_user_id := gen_random_uuid();
    encrypted_password := crypt(admin_password, gen_salt('bf'));

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_sent_at,
      recovery_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    ) VALUES (
      admin_user_id,
      '00000000-0000-0000-0000-000000000000',
      admin_email,
      encrypted_password,
      now(),
      '',
      '',
      '',
      '',
      now(),
      now(),
      'authenticated',
      'authenticated',
      null,
      null,
      '',
      0,
      null,
      '',
      null,
      false,
      null
    );
  END IF;

  -- Handle public.users table
  IF EXISTS (SELECT 1 FROM public.users WHERE email = admin_email) THEN
    -- Update existing user
    UPDATE public.users
    SET
      role = 'admin',
      status = 'active',
      full_name = 'Admin',
      updated_at = now()
    WHERE email = admin_email;
  ELSE
    -- Create new user
    INSERT INTO public.users (
      id,
      email,
      full_name,
      role,
      status,
      language_preference,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      admin_email,
      'Admin',
      'admin',
      'active',
      'en',
      now(),
      now()
    );
  END IF;

  RAISE NOTICE '✅ Created confirmed admin user: %', admin_email;
  RAISE NOTICE '📧 Login email: %', admin_email;
  RAISE NOTICE '🔑 Password: %', admin_password;
  RAISE NOTICE '🎯 Role: admin';
  RAISE NOTICE '✔️  Status: confirmed and active';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating admin user: % - %', SQLSTATE, SQLERRM;
END $$;
