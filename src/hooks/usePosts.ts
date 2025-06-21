import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Post, PostInsert, PostUpdate } from '../types'
import toast from 'react-hot-toast'

// Demo data for when Supabase is not configured
const demoData: Post[] = [
  {
    id: 1,
    title: 'New Product Launch Event',
    content:
      'We are excited to announce the launch of our latest product line. Join us for an exclusive preview and networking event. This comprehensive event will showcase our innovative solutions and provide valuable networking opportunities for industry professionals.',
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
    event_location: 'Convention Center, Downtown',
    published_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    title: 'Company Quarterly Results',
    content:
      'Our Q4 results show significant growth across all business segments. Revenue increased by 25% compared to the previous quarter. This outstanding performance reflects our commitment to excellence and strategic market positioning.',
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
    event_location: null,
    published_at: '2024-01-14T09:00:00Z'
  },
  {
    id: 3,
    title: 'Annual Conference 2024',
    content:
      'Save the date for our annual conference featuring industry leaders, workshops, and networking opportunities. This year\'s theme focuses on innovation and digital transformation.',
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
    event_location: 'Grand Hotel Conference Center',
    published_at: null
  },
  {
    id: 4,
    title: 'Industry Partnership Announcement',
    content:
      'We are pleased to announce a strategic partnership that will enhance our service offerings and expand our market reach. This collaboration represents a significant milestone in our growth strategy.',
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
    event_location: null,
    published_at: '2024-01-12T11:00:00Z'
  },
  {
    id: 5,
    title: 'Privacy Policy Update',
    content:
      'We have updated our privacy policy to ensure better protection of your personal data and to comply with the latest regulations. Please review the changes carefully.',
    type: 'privacy_policy',
    status: 'published',
    author: 'Legal Team',
    created_at: '2024-01-11T16:00:00Z',
    updated_at: '2024-01-11T16:00:00Z',
    views: 450,
    featured_image: null,
    excerpt: 'Updated privacy policy for better data protection.',
    tags: ['privacy', 'policy', 'legal', 'data-protection'],
    event_date: null,
    event_location: null,
    published_at: '2024-01-11T16:00:00Z'
  }
]

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isDemo =
    import.meta.env.VITE_SUPABASE_URL?.includes('demo-project') ||
    !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL === 'https://demo-project.supabase.co'

  const validatePost = (post: PostInsert): string | null => {
    if (!post.title?.trim()) {
      return 'Title is required'
    }
    if (post.title.length < 3) {
      return 'Title must be at least 3 characters long'
    }
    if (post.title.length > 200) {
      return 'Title must be less than 200 characters'
    }
    if (!post.content?.trim()) {
      return 'Content is required'
    }
    if (post.content.length < 10) {
      return 'Content must be at least 10 characters long'
    }
    return null
  }

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (isDemo) {
        // Use demo data
        setTimeout(() => {
          setPosts(demoData)
          setLoading(false)
        }, 500) // Simulate loading
        return
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Fetch posts error:', err)
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  const createPost = async (post: PostInsert) => {
    try {
      // Validate input
      const validationError = validatePost(post)
      if (validationError) {
        toast.error(validationError)
        return { data: null, error: validationError }
      }

      if (isDemo) {
        const newPost: Post = {
          id: Math.max(...posts.map((p) => p.id)) + 1,
          ...post,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views: 0,
          featured_image: null,
          excerpt: null,
          tags: null,
          event_date: null,
          event_location: null,
          published_at: post.type !== 'draft' ? new Date().toISOString() : null
        }
        setPosts((prev) => [newPost, ...prev])
        toast.success('Post created successfully! 🎉')
        return { data: newPost, error: null }
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            ...post,
            updated_at: new Date().toISOString(),
            published_at: post.type !== 'draft' ? new Date().toISOString() : null
          }
        ])
        .select()
        .single()

      if (error) throw error
      setPosts((prev) => [data, ...prev])
      toast.success('Post created successfully! 🎉')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post'
      toast.error(`Creation failed: ${errorMessage}`)
      console.error('Create post error:', err)
      return { data: null, error: errorMessage }
    }
  }

  const updatePost = async (id: number, updates: PostUpdate) => {
    try {
      // Validate input if updating title or content
      if (updates.title !== undefined || updates.content !== undefined) {
        const postToValidate = {
          title: updates.title || posts.find((p) => p.id === id)?.title || '',
          content: updates.content || posts.find((p) => p.id === id)?.content || '',
          type: updates.type || posts.find((p) => p.id === id)?.type || 'news'
        }
        const validationError = validatePost(postToValidate)
        if (validationError) {
          toast.error(validationError)
          return { data: null, error: validationError }
        }
      }

      if (isDemo) {
        const existingPost = posts.find((p) => p.id === id)
        if (!existingPost) {
          const errorMessage = 'Post not found'
          toast.error(errorMessage)
          return { data: null, error: errorMessage }
        }

        const updatedPost = {
          ...existingPost,
          ...updates,
          updated_at: new Date().toISOString(),
          published_at:
            updates.type === 'published' ? new Date().toISOString() : existingPost.published_at
        }
        setPosts((prev) => prev.map((post) => (post.id === id ? updatedPost : post)))
        toast.success('Post updated successfully! ✅')
        return { data: updatedPost, error: null }
      }

      const { data, error } = await supabase
        .from('posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          published_at: updates.type === 'published' ? new Date().toISOString() : undefined
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setPosts((prev) => prev.map((post) => (post.id === id ? data : post)))
      toast.success('Post updated successfully! ✅')
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update post'
      toast.error(`Update failed: ${errorMessage}`)
      console.error('Update post error:', err)
      return { data: null, error: errorMessage }
    }
  }

  const deletePost = async (id: number) => {
    try {
      if (isDemo) {
        const postToDelete = posts.find((p) => p.id === id)
        if (!postToDelete) {
          const errorMessage = 'Post not found'
          toast.error(errorMessage)
          return { error: errorMessage }
        }

        setPosts((prev) => prev.filter((post) => post.id !== id))
        toast.success(`"${postToDelete.title}" deleted successfully! 🗑️`)
        return { error: null }
      }

      const { error } = await supabase.from('posts').delete().eq('id', id)

      if (error) throw error

      const deletedPost = posts.find((p) => p.id === id)
      setPosts((prev) => prev.filter((post) => post.id !== id))
      toast.success(`"${deletedPost?.title || 'Post'}" deleted successfully! 🗑️`)
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete post'
      toast.error(`Deletion failed: ${errorMessage}`)
      console.error('Delete post error:', err)
      return { error: errorMessage }
    }
  }

  const duplicatePost = async (id: number) => {
    try {
      const postToDuplicate = posts.find((p) => p.id === id)
      if (!postToDuplicate) {
        const errorMessage = 'Post not found'
        toast.error(errorMessage)
        return { data: null, error: errorMessage }
      }

      const duplicatedPostData: PostInsert = {
        title: `${postToDuplicate.title} (Copy)`,
        content: postToDuplicate.content,
        type: postToDuplicate.type
      }

      return await createPost(duplicatedPostData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate post'
      toast.error(`Duplication failed: ${errorMessage}`)
      return { data: null, error: errorMessage }
    }
  }

  const incrementViews = async (id: number) => {
    try {
      if (isDemo) {
        setPosts((prev) =>
          prev.map((post) => (post.id === id ? { ...post, views: (post.views || 0) + 1 } : post))
        )
        return
      }

      const { error } = await supabase
        .from('posts')
        .update({ views: supabase.sql`views + 1` })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setPosts((prev) =>
        prev.map((post) => (post.id === id ? { ...post, views: (post.views || 0) + 1 } : post))
      )
    } catch (err) {
      console.error('Failed to increment views:', err)
    }
  }

  const getPostsByType = (type: string) => {
    return posts.filter((post) => post.type === type)
  }

  const getPublishedPosts = () => {
    return posts.filter((post) => (post as any).status === 'published')
  }

  const getDraftPosts = () => {
    return posts.filter((post) => (post as any).status === 'draft')
  }

  const searchPosts = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowercaseQuery) ||
        (post.content && post.content.toLowerCase().includes(lowercaseQuery)) ||
        ((post as any).author && (post as any).author.toLowerCase().includes(lowercaseQuery))
    )
  }

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    duplicatePost,
    incrementViews,
    refetch: fetchPosts,
    // Helper functions
    getPostsByType,
    getPublishedPosts,
    getDraftPosts,
    searchPosts
  }
}
