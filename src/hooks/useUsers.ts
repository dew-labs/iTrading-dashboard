import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { DatabaseUser, UserInsert, UserUpdate } from '../types'
import toast from 'react-hot-toast'

export const useUsers = () => {
  const [users, setUsers] = useState<DatabaseUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (user: UserInsert) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ ...user, updated_at: new Date().toISOString() }])
        .select()
        .single()

      if (error) throw error
      setUsers((prev) => [data, ...prev])
      toast.success('User created successfully')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateUser = async (id: string, updates: UserUpdate) => {
    try {
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
  }, [])

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
