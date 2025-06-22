import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Post, PostInsert, PostUpdate } from '../types'
import toast from 'react-hot-toast'

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const fetchPosts = useCallback(async (force = false) => {
    // Skip fetching if data already exists and not forced
    if (!force && posts.length > 0 && !loading) {
      return
    }

    try {
      setLoading(true)
      setError(null)

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
  }, [posts.length, loading])

  const createPost = async (post: PostInsert) => {
    try {
      // Validate input
      const validationError = validatePost(post)
      if (validationError) {
        toast.error(validationError)
        return { data: null, error: validationError }
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            ...post,
            updated_at: new Date().toISOString(),
            published_at: post.status === 'published' ? new Date().toISOString() : null
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

      const { data, error } = await supabase
        .from('posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          published_at: updates.status === 'published' ? new Date().toISOString() : undefined
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
      const { error } = await supabase
        .rpc('increment_post_views', { post_id: id })

      if (error) throw error

      // Note: Views tracking would need to be implemented in the database schema
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
