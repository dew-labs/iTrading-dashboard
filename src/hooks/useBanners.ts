import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
import type { Banner, BannerInsert, BannerUpdate } from '../types'
import { useToast } from './useToast'

// Fetch functions
const fetchBanners = async (): Promise<Banner[]> => {
  return supabaseHelpers.fetchData(
    supabase.from('banners').select('*').order('created_at', { ascending: false })
  )
}

const createBannerMutation = async (banner: BannerInsert): Promise<Banner> => {
  return supabaseHelpers.insertData(supabase.from('banners').insert([banner]).select().single())
}

const updateBannerMutation = async ({
  id,
  updates
}: {
  id: string
  updates: BannerUpdate
}): Promise<Banner> => {
  return supabaseHelpers.updateData(
    supabase.from('banners').update(updates).eq('id', id).select().single()
  )
}

const deleteBannerMutation = async (id: string): Promise<void> => {
  return supabaseHelpers.deleteData(supabase.from('banners').delete().eq('id', id))
}

export const useBanners = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  // Main query for banners list
  const {
    data: banners = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.banners(),
    queryFn: fetchBanners,
    staleTime: 5 * 60 * 1000, // 5 minutes - banners change infrequently
    gcTime: 15 * 60 * 1000 // Keep in cache for 15 minutes
  })

  // Create banner mutation
  const createMutation = useMutation({
    mutationFn: createBannerMutation,
    onMutate: async (newBanner: BannerInsert & { is_visible?: boolean | null }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.banners() })

      const previousBanners = queryClient.getQueryData<Banner[]>(queryKeys.banners())

      // Optimistically update
      const optimisticBanner: Banner = {
        id: crypto.randomUUID(), // Temporary ID
        name: newBanner.name || 'New Banner',
        target_url: newBanner.target_url || null,
        is_visible: typeof newBanner.is_visible === 'boolean' ? newBanner.is_visible : true,
        created_at: new Date().toISOString()
      }

      queryClient.setQueryData<Banner[]>(queryKeys.banners(), (old = []) => [
        optimisticBanner,
        ...old
      ])

      return { previousBanners }
    },
    onError: (error, variables, context) => {
      if (context?.previousBanners) {
        queryClient.setQueryData(queryKeys.banners(), context.previousBanners)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to create banner'
      toast.error(null, null, errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners() })
      toast.success('created', 'banner')
    }
  })

  // Update banner mutation
  const updateMutation = useMutation({
    mutationFn: updateBannerMutation,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.banners() })

      const previousBanners = queryClient.getQueryData<Banner[]>(queryKeys.banners())

      // Optimistically update
      queryClient.setQueryData<Banner[]>(queryKeys.banners(), (old = []) =>
        old.map(banner => (banner.id === id ? { ...banner, ...updates } : banner))
      )

      return { previousBanners }
    },
    onError: (error, variables, context) => {
      if (context?.previousBanners) {
        queryClient.setQueryData(queryKeys.banners(), context.previousBanners)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update banner'
      toast.error(null, null, errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners() })
      toast.success('updated', 'banner')
    }
  })

  // Delete banner mutation
  const deleteMutation = useMutation({
    mutationFn: deleteBannerMutation,
    onMutate: async deletedId => {
      await queryClient.cancelQueries({ queryKey: queryKeys.banners() })

      const previousBanners = queryClient.getQueryData<Banner[]>(queryKeys.banners())

      // Optimistically remove the banner
      queryClient.setQueryData<Banner[]>(queryKeys.banners(), (old = []) =>
        old.filter(banner => banner.id !== deletedId)
      )

      return { previousBanners }
    },
    onError: (error, variables, context) => {
      if (context?.previousBanners) {
        queryClient.setQueryData(queryKeys.banners(), context.previousBanners)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete banner'
      toast.error(null, null, errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.banners() })
      toast.success('deleted', 'banner')
    }
  })

  return {
    banners,
    loading,
    error: error as Error | null,
    createBanner: (banner: BannerInsert) => createMutation.mutateAsync(banner),
    updateBanner: (id: string, updates: BannerUpdate) => updateMutation.mutateAsync({ id, updates }),
    deleteBanner: (id: string) => deleteMutation.mutateAsync(id),
    refetch,
    // Additional states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}
