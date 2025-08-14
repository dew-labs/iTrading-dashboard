import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
import type { ProductWithTranslations } from '../types'
import { useToast } from './useToast'

// Fetch functions
const fetchProducts = async (): Promise<ProductWithTranslations[]> => {
  const { data, error } = await supabase
    .from('products_with_translations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  // Ensure all required fields are present and not null
  return (
    data?.map((row) => ({
      ...row,
      id: row.id || '',
      affiliate_link: row.affiliate_link ?? null,
      created_at: row.created_at || '',
      updated_at: row.updated_at || '',
      name: row.name || '',
      description: row.description || '',
      language: row.language || 'en'
    })) ?? []
  )
}

const createProductMutation = async (product: ProductWithTranslations): Promise<ProductWithTranslations> => {
  // eslint-disable-next-line camelcase
  const { affiliate_link, created_at, updated_at } = product;

  return supabaseHelpers.insertData(
    // eslint-disable-next-line camelcase
    supabase.from('products').insert([{ affiliate_link, created_at, updated_at }]).select().single()
  );
}

const updateProductMutation = async ({
  id,
  updates
}: {
  id: string
  updates: ProductWithTranslations
}): Promise<ProductWithTranslations> => {
  // eslint-disable-next-line camelcase
  const { affiliate_link, updated_at } = updates;

  return supabaseHelpers.updateData(
    // eslint-disable-next-line camelcase
    supabase.from('products').update({ affiliate_link, updated_at }).eq('id', id).select().single()
  );
}

const deleteProductMutation = async (id: string): Promise<void> => {
  return supabaseHelpers.deleteData(supabase.from('products').delete().eq('id', id))
}

export const useProducts = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  // Main query for products list
  const {
    data: products = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.products(),
    queryFn: fetchProducts,
    staleTime: 2 * 60 * 1000, // 2 minutes - products don't change frequently
    gcTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
  })

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: createProductMutation,
    onMutate: async newProduct => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.products() })

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData<ProductWithTranslations[]>(queryKeys.products())

      // Optimistically update to the new value
      const optimisticProduct: ProductWithTranslations = {
        id: `temp-${Date.now()}`,
        affiliate_link: newProduct.affiliate_link || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: newProduct.name || '',
        description: newProduct.description || '',
        language: newProduct.language || 'en'
      }

      queryClient.setQueryData<ProductWithTranslations[]>(queryKeys.products(), (old = []) => [
        optimisticProduct,
        ...old
      ])

      // Return a context object with the snapshotted value
      return { previousProducts }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.products(), context.previousProducts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product'
      toast.error(null, null, errorMessage)
    },
    onSuccess: _data => {
      // Invalidate and refetch products to get the real data
      queryClient.invalidateQueries({ queryKey: queryKeys.products() })
      toast.success('created', 'product')
    }
  })

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: updateProductMutation,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products() })

      const previousProducts = queryClient.getQueryData<ProductWithTranslations[]>(queryKeys.products())

      // Optimistically update
      queryClient.setQueryData<ProductWithTranslations[]>(queryKeys.products(), (old = []) =>
        old.map(product => (product.id === id ? { ...product, ...updates } : product))
      )

      return { previousProducts }
    },
    onError: (error, variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.products(), context.previousProducts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product'
      toast.error(null, null, errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products() })
      toast.success('updated', 'product')
    }
  })

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProductMutation,
    onMutate: async deletedId => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products() })

      const previousProducts = queryClient.getQueryData<ProductWithTranslations[]>(queryKeys.products())

      // Optimistically remove the product
      queryClient.setQueryData<ProductWithTranslations[]>(queryKeys.products(), (old = []) =>
        old.filter(product => product.id !== deletedId)
      )

      return { previousProducts }
    },
    onError: (error, variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.products(), context.previousProducts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product'
      toast.error(null, null, errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products() })
      toast.success('deleted', 'product')
    }
  })

  return {
    products,
    loading,
    error: error as Error | null,
    createProduct: (product: ProductWithTranslations) => createMutation.mutateAsync(product),
    updateProduct: (id: string, updates: ProductWithTranslations) =>
      updateMutation.mutateAsync({ id, updates }),
    deleteProduct: (id: string) => deleteMutation.mutateAsync(id),
    refetch,
    // Additional states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}
