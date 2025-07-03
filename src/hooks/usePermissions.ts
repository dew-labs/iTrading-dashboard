import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { UserRole, RolePermission } from '../types'

interface UsePermissionsReturn {
  loading: boolean
  can: (resource: string, action: string) => boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: () => boolean
  isModerator: () => boolean
  isAdminOrModerator: () => boolean
}

const fetchRolePermissions = async (role: UserRole): Promise<RolePermission[]> => {
  try {
    return supabaseHelpers.fetchData(supabase.from('role_permissions').select('*').eq('role', role))
  } catch (_error) {
    // Handle case where role permissions can't be fetched
    console.warn('Role permissions not accessible, returning empty permissions:', role)
    return []
  }
}

export const usePermissions = (): UsePermissionsReturn => {
  const { profile } = useAuthStore()

  // Fetch role-based permissions
  const {
    data: rolePermissions = [],
    isLoading: rolePermissionsLoading,
    error: rolePermissionsError
  } = useQuery({
    queryKey: queryKeys.rolePermissions(profile?.role || 'user'),
    queryFn: () => fetchRolePermissions(profile!.role),
    enabled: !!profile?.role,
    staleTime: 10 * 60 * 1000, // 10 minutes - role permissions change rarely
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: (failureCount, _error) => {
      // Don't retry role permission errors
      return failureCount < 2
    }
  })

  const loading = rolePermissionsLoading

  // Log errors for debugging but don't throw
  if (rolePermissionsError) {
    console.warn('Role permissions error:', rolePermissionsError)
  }

  const can = useCallback(
    (resource: string, action: string): boolean => {
      if (!profile) return false

      // Admins have all permissions
      if (profile.role === 'admin') return true

      // Check role-based permissions
      const hasRolePermission = rolePermissions.some(
        p => p.resource === resource && p.action === action
      )

      return hasRolePermission
    },
    [profile, rolePermissions]
  )

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return profile?.role === role
    },
    [profile?.role]
  )

  const isAdmin = useCallback((): boolean => {
    return profile?.role === 'admin'
  }, [profile?.role])

  const isModerator = useCallback((): boolean => {
    return profile?.role === 'moderator'
  }, [profile?.role])

  const isAdminOrModerator = useCallback((): boolean => {
    return profile?.role === 'admin' || profile?.role === 'moderator'
  }, [profile?.role])

  return {
    loading,
    can,
    hasRole,
    isAdmin,
    isModerator,
    isAdminOrModerator
  }
}
