import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useToast } from '../useToast'
import { supabase } from '../../lib/supabase'

/**
 * Generic CRUD configuration
 */
export interface CRUDConfig<T, CreateT, UpdateT> {
  queryKey: string[]
  tableName: string
  entityName: string
  staleTime?: number
  gcTime?: number
  selectQuery?: string
  orderBy?: {
    column: string
    ascending?: boolean
  }
  validateCreate?: (data: CreateT) => string | null
  validateUpdate?: (data: UpdateT) => string | null
  transformResponse?: (data: unknown) => T
  onCreateSuccess?: (data: T) => void
  onUpdateSuccess?: (data: T) => void
  onDeleteSuccess?: (id: string) => void
  optimisticCreate?: (data: CreateT) => T
  optimisticUpdate?: (id: string, data: UpdateT) => Partial<T>
}

/**
 * Generic CRUD hook return type
 */
export interface UseCRUDReturn<T, CreateT, UpdateT> {
  // Data
  data: T[]
  loading: boolean
  error: Error | null

  // Actions
  create: (data: CreateT) => Promise<T>
  update: (id: string, data: UpdateT) => Promise<T>
  delete: (id: string) => Promise<void>
  refetch: () => Promise<any>

  // Mutation states
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean

  // Helper functions
  getById: (id: string) => T | undefined
  getByField: (field: keyof T, value: any) => T[]
  search: (query: string, fields: (keyof T)[]) => T[]
}

/**
 * Generic CRUD hook
 * Simpler version that avoids complex TypeScript issues
 */
export function useCRUD<T extends { id: string }, CreateT = Partial<T>, UpdateT = Partial<T>>(
  config: CRUDConfig<T, CreateT, UpdateT>
): UseCRUDReturn<T, CreateT, UpdateT> {
  const {
    queryKey,
    tableName,
    entityName,
    staleTime = 2 * 60 * 1000, // 2 minutes
    gcTime = 5 * 60 * 1000, // 5 minutes
    selectQuery = '*',
    orderBy = { column: 'created_at', ascending: false },
    validateCreate,
    validateUpdate,
    transformResponse,
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
    optimisticCreate,
    optimisticUpdate
  } = config

  const queryClient = useQueryClient()
  const toast = useToast()

  // Fetch data
  const {
    data: rawData = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<T[]> => {
      // Supabase's .from() requires a string literal, but for generic CRUD we must use a runtime string.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query = (supabase.from(tableName as any) as any)
        .select(selectQuery)
        .order(orderBy.column, { ascending: orderBy.ascending ?? false })

      const { data, error } = await query

      if (error) throw error

      return transformResponse && data ? (data as unknown[]).map(transformResponse) : (data as T[])
    },
    staleTime,
    gcTime
  })

  const data = rawData as T[]

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newData: CreateT): Promise<T> => {
      // Validate if validator is provided
      if (validateCreate) {
        const validationError = validateCreate(newData)
        if (validationError) {
          throw new Error(validationError)
        }
      }

      // Supabase's .from() requires a string literal, but for generic CRUD we must use a runtime string.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from(tableName as any) as any)
        .insert(newData)
        .select()
        .single()

      if (error) throw error

      return transformResponse ? transformResponse(data) : (data as T)
    },
    onMutate: async (newData: CreateT) => {
      if (!optimisticCreate) return

      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<T[]>(queryKey)
      const optimisticItem = optimisticCreate(newData)

      queryClient.setQueryData<T[]>(queryKey, (old = []) => [optimisticItem, ...old])

      return { previousData }
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      const errorMessage = error instanceof Error ? error.message : `Failed to create ${entityName}`
      toast.error(null, null, errorMessage)
    },
    onSuccess: (data: T) => {
      queryClient.invalidateQueries({ queryKey })
      toast.success('created', entityName.toLowerCase() as any)
      onCreateSuccess?.(data)
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateT }): Promise<T> => {
      // Validate if validator is provided
      if (validateUpdate) {
        const validationError = validateUpdate(updates)
        if (validationError) {
          throw new Error(validationError)
        }
      }

      // Supabase's .from() requires a string literal, but for generic CRUD we must use a runtime string.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from(tableName as any) as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return transformResponse ? transformResponse(data) : (data as T)
    },
    onMutate: async ({ id, updates }) => {
      if (!optimisticUpdate) return

      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<T[]>(queryKey)
      const optimisticChanges = optimisticUpdate(id, updates)

      queryClient.setQueryData<T[]>(queryKey, (old = []) =>
        old.map(item => item.id === id ? { ...item, ...optimisticChanges } : item)
      )

      return { previousData }
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      const errorMessage = error instanceof Error ? error.message : `Failed to update ${entityName}`
      toast.error(null, null, errorMessage)
    },
    onSuccess: (data: T) => {
      queryClient.invalidateQueries({ queryKey })
      toast.success('updated', entityName.toLowerCase() as any)
      onUpdateSuccess?.(data)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Supabase's .from() requires a string literal, but for generic CRUD we must use a runtime string.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from(tableName as any) as any)
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey })

      const previousData = queryClient.getQueryData<T[]>(queryKey)

      queryClient.setQueryData<T[]>(queryKey, (old = []) =>
        old.filter(item => item.id !== deletedId)
      )

      return { previousData }
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${entityName}`
      toast.error(null, null, errorMessage)
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey })
      toast.success('deleted', entityName.toLowerCase() as any)
      onDeleteSuccess?.(deletedId)
    }
  })

  // Helper functions
  const getById = useCallback((id: string) => {
    return data.find(item => item.id === id)
  }, [data])

  const getByField = useCallback((field: keyof T, value: any) => {
    return data.filter(item => item[field] === value)
  }, [data])

  const search = useCallback((query: string, fields: (keyof T)[]) => {
    if (!query) return data

    const searchLower = query.toLowerCase()
    return data.filter(item =>
      fields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower)
        }
        return false
      })
    )
  }, [data])

  return {
    data,
    loading,
    error: error as Error | null,
    create: (data: CreateT) => createMutation.mutateAsync(data),
    update: (id: string, data: UpdateT) => updateMutation.mutateAsync({ id, updates: data }),
    delete: (id: string) => deleteMutation.mutateAsync(id),
    refetch,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    getById,
    getByField,
    search
  }
}

// Export specific configurations for different entities
export const createUsersConfig = () => ({
  queryKey: ['users'],
  tableName: 'users',
  entityName: 'user',
  selectQuery: '*',
  orderBy: { column: 'created_at', ascending: false },
  staleTime: 5 * 60 * 1000, // 5 minutes - users don't change frequently
  gcTime: 10 * 60 * 1000
})

export const createPostsConfig = () => ({
  queryKey: ['posts'],
  tableName: 'posts',
  entityName: 'post',
  selectQuery: '*, author:users(full_name, email)',
  orderBy: { column: 'created_at', ascending: false },
  staleTime: 1 * 60 * 1000, // 1 minute - posts change more frequently
  gcTime: 3 * 60 * 1000
})

export const createProductsConfig = () => ({
  queryKey: ['products'],
  tableName: 'products',
  entityName: 'product',
  selectQuery: '*',
  orderBy: { column: 'created_at', ascending: false },
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000
})

export const createBrokersConfig = () => ({
  queryKey: ['brokers'],
  tableName: 'brokers',
  entityName: 'broker',
  selectQuery: '*',
  orderBy: { column: 'created_at', ascending: false },
  staleTime: 5 * 60 * 1000, // 5 minutes - brokers change rarely
  gcTime: 10 * 60 * 1000
})

export const createBannersConfig = () => ({
  queryKey: ['banners'],
  tableName: 'banners',
  entityName: 'banner',
  selectQuery: '*',
  orderBy: { column: 'created_at', ascending: false },
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 5 * 60 * 1000
})
