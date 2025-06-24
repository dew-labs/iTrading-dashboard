/*
  # Add User Cascade Delete Trigger

  This migration creates a trigger that automatically deletes the corresponding
  auth.users record when a public.users record is deleted to maintain data consistency.
*/

-- Create a function to handle user deletion from auth.users
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete the corresponding auth.users record
  -- This requires elevated privileges so we use SECURITY DEFINER
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

-- Create the trigger that fires AFTER DELETE on public.users
CREATE TRIGGER on_public_user_deleted
  AFTER DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_deletion();
