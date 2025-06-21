import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Product, ProductInsert, ProductUpdate } from '../types/database'
import toast from 'react-hot-toast'

// Demo data for when Supabase is not configured
const demoData: Product[] = [
  {
    id: 1,
    name: 'Premium Plan',
    price: 29.99,
    description: 'Access to all premium features including advanced analytics, priority support, and unlimited storage.',
    subscription: true,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Professional Tools',
    price: 99.99,
    description: 'Complete set of professional tools for advanced users. One-time purchase with lifetime updates.',
    subscription: false,
    created_at: '2024-01-14T09:00:00Z'
  },
  {
    id: 3,
    name: 'Enterprise Solution',
    price: 199.99,
    description: 'Comprehensive enterprise solution with dedicated support, custom integrations, and advanced security.',
    subscription: true,
    created_at: '2024-01-13T14:00:00Z'
  },
  {
    id: 4,
    name: 'Starter Package',
    price: 9.99,
    description: 'Perfect for beginners. Includes basic features and email support.',
    subscription: true,
    created_at: '2024-01-12T11:00:00Z'
  }
]

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isDemo =
    import.meta.env.VITE_SUPABASE_URL?.includes('demo-project') ||
    !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL === 'https://demo-project.supabase.co'

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)

      if (isDemo) {
        // Use demo data
        setTimeout(() => {
          setProducts(demoData)
          setLoading(false)
        }, 500) // Simulate loading
        return
      }

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
  }, [isDemo])

  const createProduct = async (product: ProductInsert) => {
    try {
      if (isDemo) {
        const newProduct: Product = {
          id: Math.max(...products.map((p) => p.id)) + 1,
          ...product,
          created_at: new Date().toISOString()
        }
        setProducts((prev) => [newProduct, ...prev])
        toast.success('Product created successfully (Demo Mode)')
        return { data: newProduct, error: null }
      }

      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()

      if (error) throw error
      setProducts((prev) => [data, ...prev])
      toast.success('Product created successfully')
      return { data, error: null }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create product'
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateProduct = async (id: number, updates: ProductUpdate) => {
    try {
      if (isDemo) {
        const updatedProduct = {
          ...products.find((p) => p.id === id)!,
          ...updates
        }
        setProducts((prev) =>
          prev.map((product) => (product.id === id ? updatedProduct : product))
        )
        toast.success('Product updated successfully (Demo Mode)')
        return { data: updatedProduct, error: null }
      }

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
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update product'
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const deleteProduct = async (id: number) => {
    try {
      if (isDemo) {
        setProducts((prev) => prev.filter((product) => product.id !== id))
        toast.success('Product deleted successfully (Demo Mode)')
        return { error: null }
      }

      const { error } = await supabase.from('products').delete().eq('id', id)

      if (error) throw error
      setProducts((prev) => prev.filter((product) => product.id !== id))
      toast.success('Product deleted successfully')
      return { error: null }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete product'
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
