/*
  # Create Functions Migration

  This migration creates helper functions and triggers.
*/

-- Create helper functions
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for handling new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role_val text;
  user_status_val text;
BEGIN
  -- Temporarily disable RLS for this function
  PERFORM set_config('row_security', 'off', true);

  -- Debug logging
  RAISE NOTICE 'Creating user profile for: %, ID: %', NEW.email, NEW.id;

  -- Get role from metadata with validation
  user_role_val := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  IF user_role_val NOT IN ('user', 'admin', 'super_admin') THEN
    user_role_val := 'user';
  END IF;

  -- Get status from metadata with validation
  user_status_val := COALESCE(NEW.raw_user_meta_data->>'status', 'active');
  IF user_status_val NOT IN ('invited', 'active', 'inactive', 'suspended') THEN
    user_status_val := 'active';
  END IF;

  -- Insert with validated values
  INSERT INTO public.users (
    id,
    email,
    role,
    status,
    full_name,
    phone,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_role_val::user_role,
    user_status_val::user_status,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Re-enable RLS
  PERFORM set_config('row_security', 'on', true);

  RAISE NOTICE 'Successfully created user profile for: %', NEW.email;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Re-enable RLS in case of error
    PERFORM set_config('row_security', 'on', true);
    RAISE WARNING 'Failed to create user profile for % (ID: %): % - %', NEW.email, NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
