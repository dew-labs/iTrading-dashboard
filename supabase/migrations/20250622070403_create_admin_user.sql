/*
  # Create Admin User Migration

  This migration creates a confirmed admin user in both auth.users and public.users tables.
*/

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
      now(), -- email_confirmed_at (confirmed)
      '', -- empty confirmation_token means confirmed
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
      role = 'super_admin',
      status = 'active',
      full_name = 'Super Admin',
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
      'Super Admin',
      'super_admin',
      'active',
      'en',
      now(),
      now()
    );
  END IF;

  RAISE NOTICE '✅ Created confirmed admin user: %', admin_email;
  RAISE NOTICE '📧 Login email: %', admin_email;
  RAISE NOTICE '🔑 Password: %', admin_password;
  RAISE NOTICE '🎯 Role: super_admin';
  RAISE NOTICE '✔️  Status: confirmed and active';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creating admin user: % - %', SQLSTATE, SQLERRM;
END $$;
