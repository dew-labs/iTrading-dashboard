/*
  # Fix Default User Role Migration

  This migration fixes the default user role issue where invited users
  were getting 'moderator' role instead of 'user' role by default.

  Changes:
  - Updates the handle_new_user() function to default to 'user' role
  - Ensures proper role assignment from invitation metadata
*/

-- ===============================================
-- Fix Default User Role Function
-- ===============================================

-- Update the handle_new_user function to default to 'user' role instead of 'moderator'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Insert with values from invitation metadata
    -- Key fix: Default to 'user' role instead of 'moderator'
    INSERT INTO public.users (
        id,
        email,
        role,
        status,
        full_name,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            (NEW.raw_user_meta_data->>'role')::text,
            'user'  -- 🔧 Fixed: Default to 'user' instead of 'moderator'
        )::public.user_role,
        COALESCE(
            (NEW.raw_user_meta_data->>'status')::text,
            'invited'
        )::public.user_status,
        COALESCE(
            (NEW.raw_user_meta_data->>'full_name')::text,
            (NEW.raw_user_meta_data->>'name')::text
        ),
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
