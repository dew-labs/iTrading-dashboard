import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from '../utils/toast'

interface UploadOptions {
  bucket: string
  folder?: string
  allowedTypes?: string[]
  maxSizeInMB?: number
}

interface UploadResult {
  url: string
  path: string
  id: string
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadFile = async (file: File, options: UploadOptions): Promise<UploadResult> => {
    const {
      bucket = 'posts',
      folder = 'images',
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      maxSizeInMB = 10
    } = options

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      )
    }

    // Validate file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      throw new Error(`File size must be less than ${maxSizeInMB}MB`)
    }

    setIsUploading(true)
    setProgress(0)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

      setProgress(100)

      return {
        url: urlData.publicUrl,
        path: filePath,
        id: uploadData.id || fileName
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      toast.error(message)
      throw error
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  const deleteFile = async (bucket: string, path: string): Promise<void> => {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path])

      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed'
      toast.error(message)
      throw error
    }
  }

  return {
    uploadFile,
    deleteFile,
    isUploading,
    progress
  }
}
