import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Post, PostInsert, PostUpdate } from '../types/database';
import toast from 'react-hot-toast';

// Demo data for when Supabase is not configured
const demoData: Post[] = [
  {
    id: 1,
    title: 'New Product Launch Event',
    content: 'We are excited to announce the launch of our latest product line. Join us for an exclusive preview and networking event.',
    type: 'event',
    status: 'published',
    author: 'John Smith',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    views: 1250,
    featured_image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg',
    excerpt: 'Join us for an exclusive product launch event with networking opportunities.',
    tags: ['product', 'launch', 'event', 'networking'],
    event_date: '2024-02-15T18:00:00Z',
    event_location: 'Convention Center, Downtown'
  },
  {
    id: 2,
    title: 'Company Quarterly Results',
    content: 'Our Q4 results show significant growth across all business segments. Revenue increased by 25% compared to the previous quarter.',
    type: 'news',
    status: 'published',
    author: 'Sarah Wilson',
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-14T09:00:00Z',
    views: 890,
    featured_image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
    excerpt: 'Q4 results demonstrate strong performance with 25% revenue growth.',
    tags: ['quarterly', 'results', 'growth', 'revenue'],
    event_date: null,
    event_location: null
  },
  {
    id: 3,
    title: 'Annual Conference 2024',
    content: 'Save the date for our annual conference featuring industry leaders, workshops, and networking opportunities.',
    type: 'event',
    status: 'draft',
    author: 'Mike Johnson',
    created_at: '2024-01-13T14:00:00Z',
    updated_at: '2024-01-13T14:00:00Z',
    views: 0,
    featured_image: 'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg',
    excerpt: 'Annual conference with industry leaders and workshops.',
    tags: ['conference', 'annual', 'workshops', 'networking'],
    event_date: '2024-06-20T09:00:00Z',
    event_location: 'Grand Hotel Conference Center'
  },
  {
    id: 4,
    title: 'Industry Partnership Announcement',
    content: 'We are pleased to announce a strategic partnership that will enhance our service offerings and expand our market reach.',
    type: 'news',
    status: 'published',
    author: 'Emma Davis',
    created_at: '2024-01-12T11:00:00Z',
    updated_at: '2024-01-12T11:00:00Z',
    views: 2100,
    featured_image: 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg',
    excerpt: 'Strategic partnership announcement to enhance services and market reach.',
    tags: ['partnership', 'strategic', 'expansion', 'services'],
    event_date: null,
    event_location: null
  }
];

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isDemo = import.meta.env.VITE_SUPABASE_URL?.includes('demo-project') || 
                 !import.meta.env.VITE_SUPABASE_URL ||
                 import.meta.env.VITE_SUPABASE_URL === 'https://demo-project.supabase.co';

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      if (isDemo) {
        // Use demo data
        setTimeout(() => {
          setPosts(demoData);
          setLoading(false);
        }, 500); // Simulate loading
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (post: PostInsert) => {
    try {
      if (isDemo) {
        const newPost: Post = {
          id: Math.max(...posts.map(p => p.id)) + 1,
          ...post,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views: 0,
          featured_image: null,
          excerpt: null,
          tags: null,
          event_date: null,
          event_location: null
        };
        setPosts(prev => [newPost, ...prev]);
        toast.success('Post created successfully (Demo Mode)');
        return { data: newPost, error: null };
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([{ ...post, updated_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      setPosts(prev => [data, ...prev]);
      toast.success('Post created successfully');
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      toast.error(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const updatePost = async (id: number, updates: PostUpdate) => {
    try {
      if (isDemo) {
        const updatedPost = { ...posts.find(p => p.id === id)!, ...updates, updated_at: new Date().toISOString() };
        setPosts(prev => prev.map(post => post.id === id ? updatedPost : post));
        toast.success('Post updated successfully (Demo Mode)');
        return { data: updatedPost, error: null };
      }

      const { data, error } = await supabase
        .from('posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPosts(prev => prev.map(post => post.id === id ? data : post));
      toast.success('Post updated successfully');
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post';
      toast.error(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const deletePost = async (id: number) => {
    try {
      if (isDemo) {
        setPosts(prev => prev.filter(post => post.id !== id));
        toast.success('Post deleted successfully (Demo Mode)');
        return { error: null };
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPosts(prev => prev.filter(post => post.id !== id));
      toast.success('Post deleted successfully');
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post';
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  const incrementViews = async (id: number) => {
    try {
      if (isDemo) {
        setPosts(prev => prev.map(post => 
          post.id === id ? { ...post, views: post.views + 1 } : post
        ));
        return;
      }

      const { error } = await supabase
        .from('posts')
        .update({ views: supabase.sql`views + 1` })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to increment views:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    incrementViews,
    refetch: fetchPosts
  };
};