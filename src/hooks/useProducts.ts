import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Product, ProductInsert, ProductUpdate } from '../types'
import toast from 'react-hot-toast'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [])

  const createProduct = async (product: ProductInsert) => {
    try {
      const { data, error } = await supabase.from('products').insert([product]).select().single()

      if (error) throw error
      setProducts((prev) => [data, ...prev])
      toast.success('Product created successfully')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateProduct = async (id: number, updates: ProductUpdate) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setProducts((prev) => prev.map((product) => (product.id === id ? data : product)))
      toast.success('Product updated successfully')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)

      if (error) throw error
      setProducts((prev) => prev.filter((product) => product.id !== id))
      toast.success('Product deleted successfully')
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      toast.error(errorMessage)
      return { error: errorMessage }
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  }
}
