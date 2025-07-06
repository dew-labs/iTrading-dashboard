import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from '../utils/toast'
import { encode } from 'blurhash'

interface UploadOptions {
  bucket: string
  folder?: string
  allowedTypes?: string[]
  maxSizeInMB?: number
}

export interface UploadResult {
  url: string
  path: string
  id: string
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const getImageData = (image: HTMLImageElement): Promise<{data: Uint8ClampedArray, width: number, height: number}> => {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not get canvas context')
    ctx.drawImage(image, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    return Promise.resolve({ data: imageData.data, width: canvas.width, height: canvas.height })
  }

  const getBlurhashFromFile = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new window.Image()
        img.onload = async () => {
          try {
            const { data, width, height } = await getImageData(img)
            // Downscale for performance
            const compX = Math.max(4, Math.round(width / 100))
            const compY = Math.max(3, Math.round(height / 100))
            const blurhash = encode(data, width, height, compX, compY)
            resolve(blurhash)
          } catch {
            resolve(undefined)
          }
        }
        img.onerror = () => resolve(undefined)
        img.src = reader.result as string
      }
      reader.onerror = () => resolve(undefined)
      reader.readAsDataURL(file)
    })
  }

  const uploadFile = async (file: File, options: UploadOptions): Promise<UploadResult & { blurhash?: string }> => {
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

    let blurhash: string | undefined = undefined
    try {
      // Generate blurhash before upload
      blurhash = await getBlurhashFromFile(file)
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

      const result: UploadResult & { blurhash?: string } = {
        url: urlData.publicUrl,
        path: filePath,
        id: uploadData.id || fileName
      }
      if (blurhash) result.blurhash = blurhash
      return result
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
