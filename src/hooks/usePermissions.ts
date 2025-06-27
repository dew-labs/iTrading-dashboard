import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import type { Permission, UserRole, RolePermission } from '../types'

interface UsePermissionsReturn {
  permissions: Permission[]
  loading: boolean
  can: (resource: string, action: string) => boolean
  hasRole: (role: UserRole) => boolean
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
}

// Fetch functions
const fetchUserPermissions = async (userId: string): Promise<Permission[]> => {
  try {
    return supabaseHelpers.fetchData(
      supabase.from('user_permissions').select('resource, action').eq('user_id', userId)
    )
  } catch (error) {
    // Handle deleted user case - return empty permissions instead of throwing
    const errorMessage =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
    if (
      errorMessage.includes('no rows found') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden')
    ) {
      console.warn('User permissions not accessible, returning empty permissions:', userId)
      return []
    }
    throw error
  }
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
  const { user, profile } = useAuthStore()

  // Fetch user-specific permissions
  const {
    data: userPermissions = [],
    isLoading: userPermissionsLoading,
    error: userPermissionsError
  } = useQuery({
    queryKey: queryKeys.userPermissions(user?.id || ''),
    queryFn: () => fetchUserPermissions(user!.id),
    enabled: !!user?.id && !!profile, // Only fetch if profile exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's an auth/user error
      const errorMessage =
        error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
      if (
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('forbidden') ||
        errorMessage.includes('no rows found')
      ) {
        return false
      }
      return failureCount < 3
    }
  })

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

  const loading = userPermissionsLoading || rolePermissionsLoading

  // Log errors for debugging but don't throw
  if (userPermissionsError) {
    console.warn('User permissions error:', userPermissionsError)
  }
  if (rolePermissionsError) {
    console.warn('Role permissions error:', rolePermissionsError)
  }

  const can = useCallback(
    (resource: string, action: string): boolean => {
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
    },
    [profile, userPermissions, rolePermissions]
  )

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return profile?.role === role
    },
    [profile?.role]
  )

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
