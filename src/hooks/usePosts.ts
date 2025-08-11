import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
import type { Post, PostInsert, PostUpdate } from '../types'
import { useToast } from './useToast'

// Validation function - simplified since title, excerpt, content are now in translations
const validatePost = (post: PostInsert): string | null => {
  // Only validate non-translatable fields
  if (!post.type) {
    return 'Post type is required'
  }
  if (!post.status) {
    return 'Post status is required'
  }
  // Title, excerpt, content validation will be handled by translation system
  return null
}

// Extended Post type with author information
export interface PostWithAuthor extends Post, Record<string, unknown> {
  author?: {
    id: string
    full_name: string | null
    email: string
  } | null
}

// Fetch functions
const fetchPosts = async (): Promise<PostWithAuthor[]> => {
  return supabaseHelpers.fetchData(
    supabase
      .from('posts')
      .select(`
        *,
        author:users(id, full_name, email)
      `)
      .order('created_at', { ascending: false })
  )
}

const createPostMutation = async (post: PostInsert): Promise<PostWithAuthor> => {
  // Validate input
  const validationError = validatePost(post)
  if (validationError) {
    throw new Error(validationError)
  }

  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        ...post,
        type: post.type || 'news', // Ensure type is never undefined
        published_at: post.status === 'published' ? new Date().toISOString() : null
      }
    ])
    .select(`
      *,
      author:users(id, full_name, email)
    `)
    .single()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Insert failed')

  return data as PostWithAuthor
}

const updatePostMutation = async ({
  id,
  updates
}: {
  id: string
  updates: PostUpdate
}): Promise<PostWithAuthor> => {
  return supabaseHelpers.updateData(
    supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        author:users(id, full_name, email)
      `)
      .single()
  )
}

const deletePostMutation = async (id: string): Promise<void> => {
  // First, get all images associated with this post to delete from storage
  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('path')
    .eq('record_id', id)
    .eq('table_name', 'posts')

  if (imagesError) {
    console.warn('Failed to fetch images for post deletion:', imagesError)
  }

  // Delete the post (database trigger will handle image record cleanup)
  const result = await supabaseHelpers.deleteData(supabase.from('posts').delete().eq('id', id))

  // Clean up storage files if we found any
  if (images && images.length > 0) {
    const imagePaths = images.map(img => img.path)
    try {
      const { error: storageError } = await supabase.storage
        .from('posts')
        .remove(imagePaths)

      if (storageError) {
        console.warn('Failed to delete some storage files:', storageError)
        // Don't throw here - the post is already deleted from the database
      }
    } catch (error) {
      console.warn('Error during storage cleanup:', error)
    }
  }

  return result
}

const incrementPostViews = async (id: number): Promise<void> => {
  const { error } = await supabase.rpc('increment_post_views', { post_id: id })
  if (error) throw new Error(error.message)
}

export const usePosts = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  // Main query for posts list
  const {
    data: posts = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.posts(),
    queryFn: fetchPosts,
    staleTime: 1 * 60 * 1000, // 1 minute - posts change more frequently
    gcTime: 3 * 60 * 1000 // Keep in cache for 3 minutes
  })

  // Helper to invalidate all post-related queries
  const invalidateAllPostQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.posts() })
    queryClient.invalidateQueries({ queryKey: ['posts-with-translations'] })
    queryClient.invalidateQueries({ queryKey: ['translations', 'posts'] })
  }

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: createPostMutation,
    onMutate: async (newPost: PostInsert) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts() })

      const previousPosts = queryClient.getQueryData<PostWithAuthor[]>(queryKeys.posts())

      // Optimistically update - only include non-translatable fields
      const optimisticPost: PostWithAuthor = {
        id: `temp-${Date.now()}`, // Temporary ID
        type: newPost.type || 'news',
        status: newPost.status || 'draft',
        author_id: newPost.author_id || null,
        views: 0,
        published_at: newPost.status === 'published' ? new Date().toISOString() : '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: null
      }

      queryClient.setQueryData<PostWithAuthor[]>(queryKeys.posts(), (old = []) => [optimisticPost, ...old])

      return { previousPosts }
    },
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts(), context.previousPosts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post'
      toast.error(null, null, `Creation failed: ${errorMessage}`)
    },
    onSuccess: () => {
      invalidateAllPostQueries()
      toast.success('created', 'post')
    }
  })

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: updatePostMutation,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts() })

      const previousPosts = queryClient.getQueryData<PostWithAuthor[]>(queryKeys.posts())

      queryClient.setQueryData<PostWithAuthor[]>(queryKeys.posts(), (old = []) =>
        old.map(post => (post.id === id ? { ...post, ...updates } : post))
      )

      return { previousPosts }
    },
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts(), context.previousPosts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update post'
      toast.error(null, null, `Update failed: ${errorMessage}`)
    },
    onSuccess: () => {
      invalidateAllPostQueries()
      toast.success('updated', 'post')
    }
  })

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: deletePostMutation,
    onMutate: async deletedId => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts() })

      const previousPosts = queryClient.getQueryData<PostWithAuthor[]>(queryKeys.posts())
      const deletedPost = previousPosts?.find(p => p.id === deletedId)

      queryClient.setQueryData<PostWithAuthor[]>(queryKeys.posts(), (old = []) =>
        old.filter(post => post.id !== deletedId)
      )

      return { previousPosts, deletedPost }
    },
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts(), context.previousPosts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post'
      toast.error(null, null, `Deletion failed: ${errorMessage}`)
    },
    onSuccess: (_data, _variables, _context) => {
      invalidateAllPostQueries()
      toast.success('deleted', 'post')
    }
  })

  // Duplicate post mutation - simplified since content is now in translations
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const posts = queryClient.getQueryData<Post[]>(queryKeys.posts()) || []
      const postToDuplicate = posts.find(p => p.id === id)

      if (!postToDuplicate) {
        throw new Error('Post not found')
      }

      const duplicatedPostData: PostInsert = {
        type: postToDuplicate.type,
        status: 'draft',
        author_id: postToDuplicate.author_id,
        views: 0
      }

      return createPostMutation(duplicatedPostData)
    },
    onError: error => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate post'
      toast.error(null, null, `Duplication failed: ${errorMessage}`)
    },
    onSuccess: () => {
      invalidateAllPostQueries()
    }
  })

  // Increment views mutation
  const incrementViewsMutation = useMutation({
    mutationFn: incrementPostViews,
    onError: error => {
      console.error('Failed to increment views:', error)
    }
  })

  // Helper functions that work with cached data
  const getPostsByType = (type: string) => {
    return posts.filter(post => post.type === type)
  }

  const getPublishedPosts = () => {
    return posts.filter(post => post.status === 'published')
  }

  const getDraftPosts = () => {
    return posts.filter(post => post.status === 'draft')
  }

  // Search functionality removed - this should be handled by components that have access to translations
  const searchPosts = (_query: string) => {
    // Search functionality should be implemented in components that have access to translations
    return posts
  }

  const getPostById = (id: string) => {
    return posts.find(p => p.id === id)
  }

  return {
    posts,
    loading,
    error: error as Error | null,
    createPost: (post: PostInsert) => createMutation.mutateAsync(post),
    updatePost: (id: string, updates: PostUpdate) => updateMutation.mutateAsync({ id, updates }),
    deletePost: (id: string) => deleteMutation.mutateAsync(id),
    duplicatePost: (id: string) => duplicateMutation.mutateAsync(id),
    incrementViews: (id: number) => incrementViewsMutation.mutate(id),
    refetch,
    // Helper functions
    getPostsByType,
    getPublishedPosts,
    getDraftPosts,
    searchPosts,
    getPostById,
    // Additional states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending
  }
}
