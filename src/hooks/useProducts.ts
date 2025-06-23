import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
import type { Product, ProductInsert, ProductUpdate } from '../types'
import { toast } from '../utils/toast'

// Fetch functions
const fetchProducts = async (): Promise<Product[]> => {
  return supabaseHelpers.fetchData(
    supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
  )
}

const createProductMutation = async (product: ProductInsert): Promise<Product> => {
  return supabaseHelpers.insertData(
    supabase.from('products').insert([product]).select().single()
  )
}

const updateProductMutation = async ({ id, updates }: { id: number; updates: ProductUpdate }): Promise<Product> => {
  return supabaseHelpers.updateData(
    supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}

const deleteProductMutation = async (id: number): Promise<void> => {
  return supabaseHelpers.deleteData(
    supabase.from('products').delete().eq('id', id)
  )
}

export const useProducts = () => {
  const queryClient = useQueryClient()

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
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.products() })

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData<Product[]>(queryKeys.products())

      // Optimistically update to the new value
      const optimisticProduct: Product = {
        id: Date.now(), // Temporary ID
        name: newProduct.name,
        description: newProduct.description || null,
        price: newProduct.price,
        subscription: newProduct.subscription || false,
        created_at: new Date().toISOString()
      }

      queryClient.setQueryData<Product[]>(queryKeys.products(), (old = []) => [
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
      toast.error(errorMessage)
    },
    onSuccess: (_data) => {
      // Invalidate and refetch products to get the real data
      queryClient.invalidateQueries({ queryKey: queryKeys.products() })
      toast.success('Product created successfully')
    }
  })

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: updateProductMutation,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products() })

      const previousProducts = queryClient.getQueryData<Product[]>(queryKeys.products())

      // Optimistically update
      queryClient.setQueryData<Product[]>(queryKeys.products(), (old = []) =>
        old.map((product) =>
          product.id === id
            ? { ...product, ...updates }
            : product
        )
      )

      return { previousProducts }
    },
    onError: (error, variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.products(), context.previousProducts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product'
      toast.error(errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products() })
      toast.success('Product updated successfully')
    }
  })

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProductMutation,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products() })

      const previousProducts = queryClient.getQueryData<Product[]>(queryKeys.products())

      // Optimistically remove the product
      queryClient.setQueryData<Product[]>(queryKeys.products(), (old = []) =>
        old.filter((product) => product.id !== deletedId)
      )

      return { previousProducts }
    },
    onError: (error, variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.products(), context.previousProducts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product'
      toast.error(errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products() })
      toast.success('Product deleted successfully')
    }
  })

  return {
    products,
    loading,
    error: error as Error | null,
    createProduct: (product: ProductInsert) => createMutation.mutateAsync(product),
    updateProduct: (id: number, updates: ProductUpdate) =>
      updateMutation.mutateAsync({ id, updates }),
    deleteProduct: (id: number) => deleteMutation.mutateAsync(id),
    refetch,
    // Additional states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}
