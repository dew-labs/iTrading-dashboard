import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
import type { Post, PostInsert, PostUpdate } from '../types'
import toast from 'react-hot-toast'

// Validation function
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

// Fetch functions
const fetchPosts = async (): Promise<Post[]> => {
  return supabaseHelpers.fetchData(
    supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
  )
}

const createPostMutation = async (post: PostInsert): Promise<Post> => {
  // Validate input
  const validationError = validatePost(post)
  if (validationError) {
    throw new Error(validationError)
  }

  return supabaseHelpers.insertData(
    supabase
      .from('posts')
      .insert([
        {
          ...post,
          published_at: post.status === 'published' ? new Date().toISOString() : null
        }
      ])
      .select()
      .single()
  )
}

const updatePostMutation = async ({ id, updates }: { id: number; updates: PostUpdate }): Promise<Post> => {
  return supabaseHelpers.updateData(
    supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  )
}

const deletePostMutation = async (id: number): Promise<void> => {
  return supabaseHelpers.deleteData(
    supabase.from('posts').delete().eq('id', id)
  )
}

const incrementPostViews = async (id: number): Promise<void> => {
  const { error } = await supabase.rpc('increment_post_views', { post_id: id })
  if (error) throw new Error(error.message)
}

export const usePosts = () => {
  const queryClient = useQueryClient()

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

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: createPostMutation,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts() })

      const previousPosts = queryClient.getQueryData<Post[]>(queryKeys.posts())

      // Optimistically update
      const optimisticPost: Post = {
        id: Date.now(), // Temporary ID
        title: newPost.title,
        content: newPost.content || null,
        type: newPost.type,
        status: newPost.status || 'draft',
        published_at: newPost.status === 'published' ? new Date().toISOString() : '',
        created_at: new Date().toISOString()
      }

      queryClient.setQueryData<Post[]>(queryKeys.posts(), (old = []) => [
        optimisticPost,
        ...old
      ])

      return { previousPosts }
    },
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts(), context.previousPosts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post'
      toast.error(`Creation failed: ${errorMessage}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() })
      toast.success('Post created successfully! 🎉')
    }
  })

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: updatePostMutation,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts() })

      const previousPosts = queryClient.getQueryData<Post[]>(queryKeys.posts())

      queryClient.setQueryData<Post[]>(queryKeys.posts(), (old = []) =>
        old.map((post) =>
          post.id === id
            ? { ...post, ...updates }
            : post
        )
      )

      return { previousPosts }
    },
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts(), context.previousPosts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update post'
      toast.error(`Update failed: ${errorMessage}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() })
      toast.success('Post updated successfully! ✨')
    }
  })

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: deletePostMutation,
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.posts() })

      const previousPosts = queryClient.getQueryData<Post[]>(queryKeys.posts())
      const deletedPost = previousPosts?.find((p) => p.id === deletedId)

      queryClient.setQueryData<Post[]>(queryKeys.posts(), (old = []) =>
        old.filter((post) => post.id !== deletedId)
      )

      return { previousPosts, deletedPost }
    },
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(queryKeys.posts(), context.previousPosts)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post'
      toast.error(`Deletion failed: ${errorMessage}`)
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() })
      const postTitle = context?.deletedPost?.title || 'Post'
      toast.success(`"${postTitle}" deleted successfully! 🗑️`)
    }
  })

  // Duplicate post mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const posts = queryClient.getQueryData<Post[]>(queryKeys.posts()) || []
      const postToDuplicate = posts.find((p) => p.id === id)

      if (!postToDuplicate) {
        throw new Error('Post not found')
      }

      const duplicatedPostData: PostInsert = {
        title: `${postToDuplicate.title} (Copy)`,
        content: postToDuplicate.content,
        type: postToDuplicate.type
      }

      return createPostMutation(duplicatedPostData)
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate post'
      toast.error(`Duplication failed: ${errorMessage}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts() })
    }
  })

  // Increment views mutation
  const incrementViewsMutation = useMutation({
    mutationFn: incrementPostViews,
    onError: (error) => {
      console.error('Failed to increment views:', error)
    }
  })

  // Helper functions that work with cached data
  const getPostsByType = (type: string) => {
    return posts.filter((post) => post.type === type)
  }

  const getPublishedPosts = () => {
    return posts.filter((post) => post.status === 'published')
  }

  const getDraftPosts = () => {
    return posts.filter((post) => post.status === 'draft')
  }

  const searchPosts = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowercaseQuery) ||
        (post.content && post.content.toLowerCase().includes(lowercaseQuery))
    )
  }

  return {
    posts,
    loading,
    error: error as Error | null,
    createPost: (post: PostInsert) => createMutation.mutateAsync(post),
    updatePost: (id: number, updates: PostUpdate) =>
      updateMutation.mutateAsync({ id, updates }),
    deletePost: (id: number) => deleteMutation.mutateAsync(id),
    duplicatePost: (id: number) => duplicateMutation.mutateAsync(id),
    incrementViews: (id: number) => incrementViewsMutation.mutate(id),
    refetch,
    // Helper functions
    getPostsByType,
    getPublishedPosts,
    getDraftPosts,
    searchPosts,
    // Additional states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending
  }
}
