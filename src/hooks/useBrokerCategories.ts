import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys } from '../lib/supabase'
import type { BrokerCategory, BrokerCategoryInsert, BrokerCategoryUpdate } from '../types'
import { useToast } from './useToast'

export const useBrokerCategories = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  // Query for fetching all broker categories
  const {
    data: brokerCategories = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: queryKeys.brokerCategories.all(),
    queryFn: async (): Promise<BrokerCategory[]> => {
      const { data, error } = await supabase
        .from('broker_categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data
    }
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newCategory: BrokerCategoryInsert): Promise<BrokerCategory> => {
      const { data, error } = await supabase
        .from('broker_categories')
        .insert(newCategory)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brokerCategories.all() })
      toast.success('created', 'brokerCategories')
    },
    onError: (error) => {
      console.error('Failed to create broker category:', error)
      toast.error('failed', 'brokerCategories')
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BrokerCategoryUpdate }): Promise<BrokerCategory> => {
      const { data, error } = await supabase
        .from('broker_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brokerCategories.all() })
      toast.success('updated', 'brokerCategories')
    },
    onError: (error) => {
      console.error('Failed to update broker category:', error)
      toast.error('failed', 'brokerCategories')
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('broker_categories')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brokerCategories.all() })
      toast.success('deleted', 'brokerCategories')
    },
    onError: (error) => {
      console.error('Failed to delete broker category:', error)
      toast.error('failed', 'brokerCategories')
    }
  })

  return {
    brokerCategories,
    loading,
    error,
    createBrokerCategory: createMutation.mutateAsync,
    updateBrokerCategory: updateMutation.mutateAsync,
    deleteBrokerCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}