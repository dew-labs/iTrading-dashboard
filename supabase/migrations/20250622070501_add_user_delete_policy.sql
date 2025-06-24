/*
  # Add User Delete Policy

  This migration adds the missing DELETE policy for the users table
  to allow super admins to delete users.
*/

-- Add DELETE policy for users table
CREATE POLICY "Super admins can delete users"
  ON users FOR DELETE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));
