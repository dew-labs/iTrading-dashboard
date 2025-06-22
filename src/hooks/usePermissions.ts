import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Permission, UserRole, RolePermission } from '../types'

interface UsePermissionsReturn {
  permissions: Permission[];
  loading: boolean;
  can: (resource: string, action: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user, profile } = useAuthStore()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !profile) {
      setPermissions([])
      setRolePermissions([])
      setLoading(false)
      return
    }

    const fetchPermissions = async () => {
      try {
        setLoading(true)

        // Fetch user-specific permissions
        const { data: userPerms, error: userPermsError } = await supabase
          .from('user_permissions')
          .select('resource, action')
          .eq('user_id', user.id)

        if (userPermsError) throw userPermsError

        // Fetch role-based permissions
        const { data: rolePerms, error: rolePermsError } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role', profile.role)

        if (rolePermsError) throw rolePermsError

        setPermissions(userPerms || [])
        setRolePermissions(rolePerms || [])
      } catch (error) {
        console.error('Error fetching permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [user, profile])

  const can = (resource: string, action: string): boolean => {
    if (!profile) return false

    // Super admins have all permissions
    if (profile.role === 'super_admin') return true

    // Check user-specific permissions
    const hasUserPermission = permissions.some(
      p => p.resource === resource && p.action === action
    )

    if (hasUserPermission) return true

    // Check role-based permissions
    const hasRolePermission = rolePermissions.some(
      p => p.resource === resource && p.action === action
    )

    return hasRolePermission
  }

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role
  }

  const isAdmin = (): boolean => {
    return profile?.role === 'admin' || profile?.role === 'super_admin'
  }

  const isSuperAdmin = (): boolean => {
    return profile?.role === 'super_admin'
  }

  return {
    permissions,
    loading,
    can,
    hasRole,
    isAdmin,
    isSuperAdmin
  }
}
