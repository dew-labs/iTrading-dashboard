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
            WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') IN ('user', 'admin', 'super_admin')
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

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
