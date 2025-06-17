import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Banner, BannerInsert, BannerUpdate } from '../types/database';
import toast from 'react-hot-toast';

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('priority', { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const createBanner = async (banner: BannerInsert) => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert([{ ...banner, updated_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      setBanners(prev => [data, ...prev]);
      toast.success('Banner created successfully');
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create banner';
      toast.error(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updateBanner = async (id: number, updates: BannerUpdate) => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setBanners(prev => prev.map(banner => banner.id === id ? data : banner));
      toast.success('Banner updated successfully');
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update banner';
      toast.error(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const deleteBanner = async (id: number) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBanners(prev => prev.filter(banner => banner.id !== id));
      toast.success('Banner deleted successfully');
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete banner';
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const trackClick = async (id: number) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ clicks: supabase.sql`clicks + 1` })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to track click:', err);
    }
  };

  const trackImpression = async (id: number) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ impressions: supabase.sql`impressions + 1` })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to track impression:', err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    banners,
    loading,
    error,
    createBanner,
    updateBanner,
    deleteBanner,
    trackClick,
    trackImpression,
    refetch: fetchBanners
  };
};