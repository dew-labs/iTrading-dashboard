/*
  # Cleanup User Permissions Migration

  Since we removed the permission modal UI and are using pure RBAC,
  we can remove the user_permissions table to simplify the system.
  All permissions are now managed through role_permissions only.
*/

-- ===============================================
-- REMOVE USER PERMISSIONS INFRASTRUCTURE
-- ===============================================

-- Drop audit trigger for user_permissions
DROP TRIGGER IF EXISTS audit_user_permissions_trigger ON user_permissions;

-- Drop RLS policies for user_permissions
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can view all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON user_permissions;

-- Drop the user_permissions table
DROP TABLE IF EXISTS user_permissions CASCADE;

-- ===============================================
-- UPDATE ADMIN ROLE PERMISSIONS
-- ===============================================

-- Remove admin permissions for user_permissions since table no longer exists
DELETE FROM role_permissions
WHERE resource = 'user_permissions';

-- ===============================================
-- LOG THE CLEANUP
-- ===============================================

DO $$
BEGIN
  RAISE NOTICE '🧹 User Permissions Cleanup Complete:';
  RAISE NOTICE '  • Removed user_permissions table';
  RAISE NOTICE '  • Removed related RLS policies';
  RAISE NOTICE '  • Removed audit triggers';
  RAISE NOTICE '  • Updated role permissions';
  RAISE NOTICE '';
  RAISE NOTICE '✅ System now uses pure role-based permissions (RBAC)';
  RAISE NOTICE '✅ Permissions are managed via role_permissions table only';
END;
$$;
