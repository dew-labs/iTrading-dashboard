import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { DatabaseUser, UserInsert, UserUpdate } from '../types'
import { inviteUser } from '../services/userService'
import { usePermissions } from './usePermissions'
import toast from 'react-hot-toast'

export const useUsers = () => {
  const [users, setUsers] = useState<DatabaseUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { can } = usePermissions()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)

      // Check if user has permission to read users
      if (!can('users', 'read')) {
        setError('You do not have permission to view users')
        setUsers([])
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [can])

  const createUser = async (user: UserInsert) => {
    try {
      // Check permission
      if (!can('users', 'create')) {
        toast.error('You do not have permission to create users')
        return { data: null, error: 'Permission denied' }
      }

      // Use the invite user service
      const { success, error: inviteError, tempPassword } = await inviteUser(
        user.email,
        user.role,
        user.full_name || undefined
      )

      if (!success) {
        return { data: null, error: inviteError || 'Failed to create user' }
      }

      // Refresh the user list
      await fetchUsers()

      return { data: { email: user.email, tempPassword }, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateUser = async (id: string, updates: UserUpdate) => {
    try {
      // Check permission
      if (!can('users', 'update')) {
        toast.error('You do not have permission to update users')
        return { data: null, error: 'Permission denied' }
      }

      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setUsers((prev) => prev.map((user) => (user.id === id ? data : user)))
      toast.success('User updated successfully')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const deleteUser = async (id: string) => {
    try {
      // Check permission
      if (!can('users', 'delete')) {
        toast.error('You do not have permission to delete users')
        return { error: 'Permission denied' }
      }

      const { error } = await supabase.from('users').delete().eq('id', id)

      if (error) throw error
      setUsers((prev) => prev.filter((user) => user.id !== id))
      toast.success('User deleted successfully')
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
      toast.error(errorMessage)
      return { error: errorMessage }
    }
  }

  const updateLastLogin = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('Failed to update last login:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers]) // Re-fetch when permissions change

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    updateLastLogin,
    refetch: fetchUsers
  }
}
