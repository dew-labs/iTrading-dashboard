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
-- AUDIT TRIGGER FUNCTION & TRIGGERS
-- ===============================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger AS $$
DECLARE
  current_user_record users%ROWTYPE;
  old_values jsonb := '{}';
  new_values jsonb := '{}';
  changed_fields text[] := ARRAY[]::text[];
  excluded_columns text[] := ARRAY['updated_at', 'last_login'];
  record_id_value uuid;
BEGIN
  SELECT * INTO current_user_record FROM users WHERE id = auth.uid();
  IF current_user_record.role NOT IN ('admin', 'moderator') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF TG_OP = 'DELETE' THEN
    record_id_value := OLD.id;
  ELSE
    record_id_value := NEW.id;
  END IF;
  IF TG_OP = 'DELETE' THEN
    old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);
    SELECT array_agg(key) INTO changed_fields FROM (
      SELECT key FROM jsonb_each(to_jsonb(NEW))
      WHERE NOT (key = ANY(excluded_columns))
      AND to_jsonb(NEW) ->> key IS DISTINCT FROM to_jsonb(OLD) ->> key
    ) AS changes;
    IF array_length(changed_fields, 1) IS NULL THEN
      RETURN NEW;
    END IF;
  END IF;
  INSERT INTO audit_logs (
    user_id, user_email, user_role, table_name, record_id, action, old_values, new_values, changed_fields, session_id
  ) VALUES (
    current_user_record.id, current_user_record.email, current_user_record.role, TG_TABLE_NAME, record_id_value, TG_OP, old_values, new_values, changed_fields, current_setting('audit.session_id', true)
  );
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Audit logging failed for table % operation %: % - %', TG_TABLE_NAME, TG_OP, SQLSTATE, SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_posts_trigger AFTER INSERT OR UPDATE OR DELETE ON posts FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_products_trigger AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_brokers_trigger AFTER INSERT OR UPDATE OR DELETE ON brokers FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_banners_trigger AFTER INSERT OR UPDATE OR DELETE ON banners FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_role_permissions_trigger AFTER INSERT OR UPDATE OR DELETE ON role_permissions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_images_trigger AFTER INSERT OR UPDATE OR DELETE ON images FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ===============================================
-- AUDIT STATISTICS FUNCTION
-- ===============================================

-- Function to get audit statistics
CREATE OR REPLACE FUNCTION get_audit_stats()
RETURNS jsonb AS $$
DECLARE
  total_count integer;
  today_count integer;
  week_count integer;
  most_active jsonb;
  activity_by_table jsonb;
  activity_by_action jsonb;
  recent_activity jsonb;
BEGIN
  -- Total activities
  SELECT COUNT(*) INTO total_count FROM audit_logs;

  -- Activities today
  SELECT COUNT(*) INTO today_count
  FROM audit_logs
  WHERE created_at >= CURRENT_DATE;

  -- Activities this week
  SELECT COUNT(*) INTO week_count
  FROM audit_logs
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';

  -- Most active user
  SELECT jsonb_build_object(
    'user_email', COALESCE(user_email, 'Unknown'),
    'activity_count', activity_count
  ) INTO most_active
  FROM (
    SELECT user_email, COUNT(*) as activity_count
    FROM audit_logs
    WHERE user_email IS NOT NULL
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY user_email
    ORDER BY activity_count DESC
    LIMIT 1
  ) most_active_query;

  -- Activity by table
  SELECT jsonb_object_agg(table_name, activity_count) INTO activity_by_table
  FROM (
    SELECT table_name, COUNT(*) as activity_count
    FROM audit_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY table_name
    ORDER BY activity_count DESC
  ) table_stats;

  -- Activity by action
  SELECT jsonb_object_agg(action, activity_count) INTO activity_by_action
  FROM (
    SELECT action, COUNT(*) as activity_count
    FROM audit_logs
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY action
    ORDER BY activity_count DESC
  ) action_stats;

  -- Recent activity (last 10)
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_email', user_email,
      'table_name', table_name,
      'action', action,
      'created_at', created_at
    )
  ) INTO recent_activity
  FROM (
    SELECT user_email, table_name, action, created_at
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT 10
  ) recent_query;

  RETURN jsonb_build_object(
    'total_activities', total_count,
    'activities_today', today_count,
    'activities_week', week_count,
    'most_active_user', COALESCE(most_active, '{}'),
    'activity_by_table', COALESCE(activity_by_table, '{}'),
    'activity_by_action', COALESCE(activity_by_action, '{}'),
    'recent_activity', COALESCE(recent_activity, '[]')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_audit_stats() TO authenticated;

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
  USING (is_visible = true);

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
CREATE POLICY "Visible banners are viewable by everyone"
  ON banners FOR SELECT
  TO public
  USING (is_visible = true);

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

-- Audit logs table policies
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage audit logs"
  ON audit_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

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
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      admin_email,
      'Admin',
      'admin',
      'active',
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
