import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
import type { Broker, BrokerInsert, BrokerUpdate } from '../types'
import { useToast } from './useToast'

// Fetch functions
const fetchBrokers = async (): Promise<Broker[]> => {
  return supabaseHelpers.fetchData(
    supabase.from('brokers').select('*').order('created_at', { ascending: false })
  )
}

const createBrokerMutation = async (broker: BrokerInsert): Promise<Broker> => {
  return supabaseHelpers.insertData(supabase.from('brokers').insert([broker]).select().single())
}

const updateBrokerMutation = async ({
  id,
  updates
}: {
  id: string
  updates: BrokerUpdate
}): Promise<Broker> => {
  return supabaseHelpers.updateData(
    supabase.from('brokers').update(updates).eq('id', id).select().single()
  )
}

const deleteBrokerMutation = async (id: string): Promise<void> => {
  return supabaseHelpers.deleteData(supabase.from('brokers').delete().eq('id', id))
}

export const useBrokers = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  // Main query for brokers list
  const {
    data: brokers = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.brokers(),
    queryFn: fetchBrokers,
    staleTime: 2 * 60 * 1000, // 2 minutes - brokers don't change frequently
    gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
  })

  // Create broker mutation
  const createMutation = useMutation({
    mutationFn: createBrokerMutation,
    onMutate: async newBroker => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.brokers() })

      // Snapshot the previous value
      const previousBrokers = queryClient.getQueryData<Broker[]>(queryKeys.brokers())

      // Optimistically update to the new value
      const optimisticBroker: Broker = {
        id: crypto.randomUUID(), // Temporary ID
        name: newBroker.name,
        established_in: newBroker.established_in || null,
        headquarter: newBroker.headquarter || null,
        description: newBroker.description || null,
        created_at: new Date().toISOString(),
        is_visible: newBroker.is_visible || true,
        updated_at: new Date().toISOString()
      }

      queryClient.setQueryData<Broker[]>(queryKeys.brokers(), (old = []) => [
        optimisticBroker,
        ...old
      ])

      // Return a context object with the snapshotted value
      return { previousBrokers }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBrokers) {
        queryClient.setQueryData(queryKeys.brokers(), context.previousBrokers)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to create broker'
      toast.error(null, null, errorMessage)
    },
    onSuccess: _data => {
      // Invalidate and refetch brokers to get the real data
      queryClient.invalidateQueries({ queryKey: queryKeys.brokers() })
      toast.success('created', 'broker')
    }
  })

  // Update broker mutation
  const updateMutation = useMutation({
    mutationFn: updateBrokerMutation,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.brokers() })

      const previousBrokers = queryClient.getQueryData<Broker[]>(queryKeys.brokers())

      // Optimistically update
      queryClient.setQueryData<Broker[]>(queryKeys.brokers(), (old = []) =>
        old.map(broker => (broker.id === id ? { ...broker, ...updates } : broker))
      )

      return { previousBrokers }
    },
    onError: (error, variables, context) => {
      if (context?.previousBrokers) {
        queryClient.setQueryData(queryKeys.brokers(), context.previousBrokers)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update broker'
      toast.error(null, null, errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brokers() })
      toast.success('updated', 'broker')
    }
  })

  // Delete broker mutation
  const deleteMutation = useMutation({
    mutationFn: deleteBrokerMutation,
    onMutate: async deletedId => {
      await queryClient.cancelQueries({ queryKey: queryKeys.brokers() })

      const previousBrokers = queryClient.getQueryData<Broker[]>(queryKeys.brokers())

      // Optimistically remove the broker
      queryClient.setQueryData<Broker[]>(queryKeys.brokers(), (old = []) =>
        old.filter(broker => broker.id !== deletedId)
      )

      return { previousBrokers }
    },
    onError: (error, variables, context) => {
      if (context?.previousBrokers) {
        queryClient.setQueryData(queryKeys.brokers(), context.previousBrokers)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete broker'
      toast.error(null, null, errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brokers() })
      toast.success('deleted', 'broker')
    }
  })

  return {
    brokers,
    loading,
    error: error as Error | null,
    createBroker: (broker: BrokerInsert) => createMutation.mutateAsync(broker),
    updateBroker: (id: string, updates: BrokerUpdate) => updateMutation.mutateAsync({ id, updates }),
    deleteBroker: (id: string) => deleteMutation.mutateAsync(id),
    refetch,
    // Additional states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}
