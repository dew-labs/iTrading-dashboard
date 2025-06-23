import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
import type { DatabaseUser, UserInsert, UserUpdate } from '../types'
import { inviteUser } from '../services/userService'
import { usePermissions } from './usePermissions'
import { toast } from '../utils/toast'

// Fetch functions
const fetchUsers = async (): Promise<DatabaseUser[]> => {
  return supabaseHelpers.fetchData(
    supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
  )
}

const updateUserMutation = async ({ id, updates }: { id: string; updates: UserUpdate }): Promise<DatabaseUser> => {
  return supabaseHelpers.updateData(
    supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
  )
}

const deleteUserMutation = async (id: string): Promise<void> => {
  return supabaseHelpers.deleteData(
    supabase.from('users').delete().eq('id', id)
  )
}

const updateLastLoginMutation = async (id: string): Promise<void> => {
  return supabaseHelpers.deleteData(
    supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)
  )
}

export const useUsers = () => {
  const queryClient = useQueryClient()
  const { can, isSuperAdmin } = usePermissions()

  // Main query for users list
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.users(),
    queryFn: fetchUsers,
    staleTime: 3 * 60 * 1000, // 3 minutes - user data changes less frequently
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled: can('users', 'read'), // Only fetch if user has permission
    select: (data) => {
      // Additional permission check at data level
      if (!can('users', 'read')) {
        return []
      }
      return data
    }
  })

  // Create user mutation - restricted to super admins only
  const createMutation = useMutation({
    mutationFn: async (user: UserInsert) => {
      if (!isSuperAdmin()) {
        throw new Error('Only super admins can create users')
      }

      const { success, error: inviteError, tempPassword } = await inviteUser(
        user.email,
        user.role,
        user.full_name || undefined
      )

      if (!success) {
        throw new Error(inviteError || 'Failed to create user')
      }

      return { email: user.email, tempPassword }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user'
      toast.error(errorMessage)
    },
    onSuccess: () => {
      // Refresh the user list
      queryClient.invalidateQueries({ queryKey: queryKeys.users() })
      toast.success('User invited successfully')
    }
  })

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: updateUserMutation,
    onMutate: async ({ id, updates }) => {
      if (!can('users', 'update')) {
        throw new Error('You do not have permission to update users')
      }

      await queryClient.cancelQueries({ queryKey: queryKeys.users() })

      const previousUsers = queryClient.getQueryData<DatabaseUser[]>(queryKeys.users())

      // Optimistically update
      queryClient.setQueryData<DatabaseUser[]>(queryKeys.users(), (old = []) =>
        old.map((user) =>
          user.id === id
            ? { ...user, ...updates, updated_at: new Date().toISOString() }
            : user
        )
      )

      return { previousUsers }
    },
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users(), context.previousUsers)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user'
      toast.error(errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() })
      toast.success('User updated successfully')
    }
  })

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUserMutation,
    onMutate: async (deletedId) => {
      if (!can('users', 'delete')) {
        throw new Error('You do not have permission to delete users')
      }

      await queryClient.cancelQueries({ queryKey: queryKeys.users() })

      const previousUsers = queryClient.getQueryData<DatabaseUser[]>(queryKeys.users())

      // Optimistically remove the user
      queryClient.setQueryData<DatabaseUser[]>(queryKeys.users(), (old = []) =>
        old.filter((user) => user.id !== deletedId)
      )

      return { previousUsers }
    },
    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users(), context.previousUsers)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user'
      toast.error(errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users() })
      toast.success('User deleted successfully')
    }
  })

  // Update last login mutation (silent operation)
  const updateLastLoginMutationHook = useMutation({
    mutationFn: updateLastLoginMutation,
    onError: (error) => {
      console.error('Failed to update last login:', error)
    },
    onSuccess: () => {
      // Silently update cache
      queryClient.invalidateQueries({ queryKey: queryKeys.users() })
    }
  })

  // Error handling for permissions
  const permissionError = !can('users', 'read') ? 'You do not have permission to view users' : null

  return {
    users: permissionError ? [] : users,
    loading,
    error: permissionError ? new Error(permissionError) : (error as Error | null),
    createUser: (user: UserInsert) => createMutation.mutateAsync(user),
    updateUser: (id: string, updates: UserUpdate) =>
      updateMutation.mutateAsync({ id, updates }),
    deleteUser: (id: string) => deleteMutation.mutateAsync(id),
    updateLastLogin: (id: string) => updateLastLoginMutationHook.mutate(id),
    refetch,
    // Additional states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}
