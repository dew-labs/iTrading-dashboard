import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
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

// Fetch functions
const fetchUserPermissions = async (userId: string): Promise<Permission[]> => {
  return supabaseHelpers.fetchData(
    supabase
      .from('user_permissions')
      .select('resource, action')
      .eq('user_id', userId)
  )
}

const fetchRolePermissions = async (role: UserRole): Promise<RolePermission[]> => {
  return supabaseHelpers.fetchData(
    supabase
      .from('role_permissions')
      .select('*')
      .eq('role', role)
  )
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user, profile } = useAuthStore()

  // Fetch user-specific permissions
  const {
    data: userPermissions = [],
    isLoading: userPermissionsLoading
  } = useQuery({
    queryKey: queryKeys.userPermissions(user?.id || ''),
    queryFn: () => fetchUserPermissions(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
  })

  // Fetch role-based permissions
  const {
    data: rolePermissions = [],
    isLoading: rolePermissionsLoading
  } = useQuery({
    queryKey: queryKeys.rolePermissions(profile?.role || 'user'),
    queryFn: () => fetchRolePermissions(profile!.role),
    enabled: !!profile?.role,
    staleTime: 10 * 60 * 1000, // 10 minutes - role permissions change rarely
    gcTime: 30 * 60 * 1000 // Keep in cache for 30 minutes
  })

  const loading = userPermissionsLoading || rolePermissionsLoading

  const can = useCallback((resource: string, action: string): boolean => {
    if (!profile) return false

    // Super admins have all permissions
    if (profile.role === 'super_admin') return true

    // Check user-specific permissions
    const hasUserPermission = userPermissions.some(
      p => p.resource === resource && p.action === action
    )

    if (hasUserPermission) return true

    // Check role-based permissions
    const hasRolePermission = rolePermissions.some(
      p => p.resource === resource && p.action === action
    )

    return hasRolePermission
  }, [profile, userPermissions, rolePermissions])

  const hasRole = useCallback((role: UserRole): boolean => {
    return profile?.role === role
  }, [profile?.role])

  const isAdmin = useCallback((): boolean => {
    return profile?.role === 'admin' || profile?.role === 'super_admin'
  }, [profile?.role])

  const isSuperAdmin = useCallback((): boolean => {
    return profile?.role === 'super_admin'
  }, [profile?.role])

  return {
    permissions: userPermissions,
    loading,
    can,
    hasRole,
    isAdmin,
    isSuperAdmin
  }
}
