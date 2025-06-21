import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Banner, BannerInsert, BannerUpdate } from '../types'
import toast from 'react-hot-toast'

// Demo data for when Supabase is not configured
const demoData: Banner[] = [
  {
    id: '1',
    target_url: 'https://example.com/welcome',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    target_url: 'https://example.com/promotion',
    is_active: true,
    created_at: '2024-01-14T09:00:00Z'
  },
  {
    id: '3',
    target_url: 'https://example.com/new-features',
    is_active: true,
    created_at: '2024-01-13T14:00:00Z'
  },
  {
    id: '4',
    target_url: 'https://example.com/maintenance',
    is_active: false,
    created_at: '2024-01-12T11:00:00Z'
  }
]

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isDemo =
    import.meta.env.VITE_SUPABASE_URL?.includes('demo-project') ||
    !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL === 'https://demo-project.supabase.co'

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true)

      if (isDemo) {
        // Use demo data
        setTimeout(() => {
          setBanners(demoData)
          setLoading(false)
        }, 500) // Simulate loading
        return
      }

      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBanners(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to fetch banners')
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  const createBanner = async (banner: BannerInsert) => {
    try {
      if (isDemo) {
        const newBanner: Banner = {
          id: (Math.max(...banners.map((b) => parseInt(b.id))) + 1).toString(),
          ...banner,
          created_at: new Date().toISOString()
        }
        setBanners((prev) => [newBanner, ...prev])
        toast.success('Banner created successfully (Demo Mode)')
        return { data: newBanner, error: null }
      }

      const { data, error } = await supabase.from('banners').insert([banner]).select().single()

      if (error) throw error
      setBanners((prev) => [data, ...prev])
      toast.success('Banner created successfully')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create banner'
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateBanner = async (id: string, updates: BannerUpdate) => {
    try {
      if (isDemo) {
        const updatedBanner = {
          ...banners.find((b) => b.id === id)!,
          ...updates
        }
        setBanners((prev) => prev.map((banner) => (banner.id === id ? updatedBanner : banner)))
        toast.success('Banner updated successfully (Demo Mode)')
        return { data: updatedBanner, error: null }
      }

      const { data, error } = await supabase
        .from('banners')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setBanners((prev) => prev.map((banner) => (banner.id === id ? data : banner)))
      toast.success('Banner updated successfully')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update banner'
      toast.error(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const deleteBanner = async (id: string) => {
    try {
      if (isDemo) {
        setBanners((prev) => prev.filter((banner) => banner.id !== id))
        toast.success('Banner deleted successfully (Demo Mode)')
        return { error: null }
      }

      const { error } = await supabase.from('banners').delete().eq('id', id)

      if (error) throw error
      setBanners((prev) => prev.filter((banner) => banner.id !== id))
      toast.success('Banner deleted successfully')
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete banner'
      toast.error(errorMessage)
      return { error: errorMessage }
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  return {
    banners,
    loading,
    error,
    createBanner,
    updateBanner,
    deleteBanner,
    refetch: fetchBanners
  }
}
