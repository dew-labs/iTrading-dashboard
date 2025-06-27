import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, queryKeys, supabaseHelpers } from '../lib/supabase'
import type { Image, ImageInsert, ImageUpdate } from '../types'
import { toast } from '../utils/toast'

// Fetch functions
const fetchImages = async (): Promise<Image[]> => {
  return supabaseHelpers.fetchData(
    supabase.from('images').select('*').order('created_at', { ascending: false })
  )
}

const fetchImagesByTable = async (tableName: string): Promise<Image[]> => {
  return supabaseHelpers.fetchData(
    supabase
      .from('images')
      .select('*')
      .eq('table_name', tableName)
      .order('created_at', { ascending: false })
  )
}

const fetchImagesByRecord = async (tableName: string, recordId: string): Promise<Image[]> => {
  return supabaseHelpers.fetchData(
    supabase
      .from('images')
      .select('*')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false })
  )
}

const createImageMutation = async (image: ImageInsert): Promise<Image> => {
  return supabaseHelpers.insertData(supabase.from('images').insert([image]).select().single())
}

const updateImageMutation = async ({
  id,
  updates
}: {
  id: number
  updates: ImageUpdate
}): Promise<Image> => {
  return supabaseHelpers.updateData(
    supabase.from('images').update(updates).eq('id', id).select().single()
  )
}

const deleteImageMutation = async (id: number): Promise<void> => {
  return supabaseHelpers.deleteData(supabase.from('images').delete().eq('id', id))
}

export const useImages = (tableName?: string, recordId?: string) => {
  const queryClient = useQueryClient()

  // Main query for images list
  const {
    data: images = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey:
      tableName && recordId
        ? queryKeys.imagesByRecord(tableName, recordId)
        : tableName
          ? queryKeys.imagesByTable(tableName)
          : queryKeys.images(),
    queryFn:
      tableName && recordId
        ? () => fetchImagesByRecord(tableName, recordId)
        : tableName
          ? () => fetchImagesByTable(tableName)
          : fetchImages,
    staleTime: 5 * 60 * 1000, // 5 minutes - images change infrequently
    gcTime: 15 * 60 * 1000 // Keep in cache for 15 minutes
  })

  // Create image mutation
  const createMutation = useMutation({
    mutationFn: createImageMutation,
    onError: error => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create image'
      toast.error(errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.images() })
      if (tableName) {
        queryClient.invalidateQueries({ queryKey: queryKeys.imagesByTable(tableName) })
      }
      if (tableName && recordId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.imagesByRecord(tableName, recordId) })
      }
      toast.success('Image created successfully')
    }
  })

  // Update image mutation
  const updateMutation = useMutation({
    mutationFn: updateImageMutation,
    onError: error => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update image'
      toast.error(errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.images() })
      if (tableName) {
        queryClient.invalidateQueries({ queryKey: queryKeys.imagesByTable(tableName) })
      }
      if (tableName && recordId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.imagesByRecord(tableName, recordId) })
      }
      toast.success('Image updated successfully')
    }
  })

  // Delete image mutation
  const deleteMutation = useMutation({
    mutationFn: deleteImageMutation,
    onError: error => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image'
      toast.error(errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.images() })
      if (tableName) {
        queryClient.invalidateQueries({ queryKey: queryKeys.imagesByTable(tableName) })
      }
      if (tableName && recordId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.imagesByRecord(tableName, recordId) })
      }
      toast.success('Image deleted successfully')
    }
  })

  // Helper function to get the first image for a record
  const getImageForRecord = (tableName: string, recordId: string): Image | undefined => {
    return images.find(img => img.table_name === tableName && img.record_id === recordId)
  }

  // Helper function to get all images for a record
  const getImagesForRecord = (tableName: string, recordId: string): Image[] => {
    return images.filter(img => img.table_name === tableName && img.record_id === recordId)
  }

  // Helper function to create image record from upload result
  const createImageFromUpload = async (
    tableName: string,
    recordId: string,
    uploadResult: {
      url: string
      path: string
      id: string
    },
    altText?: string,
    fileSize?: number,
    mimeType?: string
  ) => {
    const imageData: ImageInsert = {
      table_name: tableName,
      record_id: recordId,
      image_url: uploadResult.url,
      storage_object_id: uploadResult.id,
      alt_text: altText || null,
      file_size: fileSize || null,
      mime_type: mimeType || null
    }

    return createMutation.mutateAsync(imageData)
  }

  return {
    images,
    loading,
    error: error as Error | null,
    createImage: (image: ImageInsert) => createMutation.mutateAsync(image),
    createImageFromUpload,
    updateImage: (id: number, updates: ImageUpdate) => updateMutation.mutateAsync({ id, updates }),
    deleteImage: (id: number) => deleteMutation.mutateAsync(id),
    refetch,
    getImageForRecord,
    getImagesForRecord,
    // Additional states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

// Hook specifically for getting a single image for a record
export const useRecordImage = (tableName: string, recordId: string) => {
  const { images, loading, error } = useImages(tableName, recordId)

  return {
    image: images[0] || null,
    loading,
    error
  }
}
