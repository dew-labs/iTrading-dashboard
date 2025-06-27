import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️  Supabase environment variables are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Query key factories for consistent caching
export const queryKeys = {
  // Users
  users: () => ['users'] as const,
  user: (id: string) => ['users', id] as const,
  userPermissions: (userId: string) => ['user-permissions', userId] as const,

  // Posts
  posts: () => ['posts'] as const,
  post: (id: number) => ['posts', id] as const,
  postsByType: (type: string) => ['posts', 'type', type] as const,

  // Products
  products: () => ['products'] as const,
  product: (id: number) => ['products', id] as const,

  // Brokers
  brokers: () => ['brokers'] as const,
  broker: (id: number) => ['brokers', id] as const,

  // Banners
  banners: () => ['banners'] as const,
  banner: (id: string) => ['banners', id] as const,

  // Images
  images: () => ['images'] as const,
  image: (id: number) => ['images', id] as const,
  imagesByTable: (tableName: string) => ['images', 'table', tableName] as const,
  imagesByRecord: (tableName: string, recordId: string) =>
    ['images', 'table', tableName, 'record', recordId] as const,

  // Permissions
  rolePermissions: (role: string) => ['role-permissions', role] as const,
  permissions: () => ['permissions'] as const
} as const

// Helper functions for common Supabase operations
export const supabaseHelpers = {
  // Generic fetch function with error handling
  async fetchData<T> (queryBuilder: PromiseLike<{data: T[] | null; error: unknown}>): Promise<T[]> {
    const { data, error } = await queryBuilder
    if (error) throw new Error(error instanceof Error ? error.message : 'Unknown error')
    return data || []
  },

  // Generic single item fetch
  async fetchSingle<T> (queryBuilder: PromiseLike<{data: T | null; error: unknown}>): Promise<T> {
    const { data, error } = await queryBuilder
    if (error) throw new Error(error instanceof Error ? error.message : 'Unknown error')
    if (!data) throw new Error('Not found')
    return data
  },

  // Generic insert with optimistic updates
  async insertData<T> (queryBuilder: PromiseLike<{data: T | null; error: unknown}>): Promise<T> {
    const { data, error } = await queryBuilder
    if (error) throw new Error(error instanceof Error ? error.message : 'Unknown error')
    if (!data) throw new Error('Insert failed')
    return data
  },

  // Generic update with optimistic updates
  async updateData<T> (queryBuilder: PromiseLike<{data: T | null; error: unknown}>): Promise<T> {
    const { data, error } = await queryBuilder
    if (error) throw new Error(error instanceof Error ? error.message : 'Unknown error')
    if (!data) throw new Error('Update failed')
    return data
  },

  // Generic delete
  async deleteData (queryBuilder: PromiseLike<{error: unknown}>): Promise<void> {
    const { error } = await queryBuilder
    if (error) throw new Error(error instanceof Error ? error.message : 'Unknown error')
  }
}

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const getCurrentUser = async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()
  return { user, error }
}
