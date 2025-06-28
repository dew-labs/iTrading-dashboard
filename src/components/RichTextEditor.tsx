import React, { useRef, useCallback } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { AlertCircle } from 'lucide-react'
import { useFileUpload } from '../hooks/useFileUpload'
import { toast } from '../utils/toast'
import { getTinyMCEConfig, type TinyMCEUploadConfig } from '../utils/tinymceConfig'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  error?: string | undefined
  disabled?: boolean
  label?: string
  required?: boolean
  className?: string
  key?: string | number
  height?: number
  bucket?: string
  folder?: string
}

interface TinyMCEEditor {
  getContent: () => string
  setContent: (content: string) => void
  focus: () => void
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  error,
  disabled = false,
  label,
  required = false,
  className = '',
  height = 400,
  bucket = 'posts',
  folder = 'images'
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null)
  const { uploadFile, isUploading } = useFileUpload()

  // Custom image upload handler
  const handleImageUpload = useCallback(
    (blobInfo: unknown, progress: (percent: number) => void) => {
      return new Promise<string>((resolve, reject) => {
        const uploadAsync = async () => {
          try {
            // Type guard for blobInfo
            if (!blobInfo || typeof blobInfo !== 'object' || !('blob' in blobInfo)) {
              reject('Invalid blob info')
              return
            }

            const blob = (blobInfo as {blob: () => Blob}).blob()
            const file =
              blob instanceof File ? blob : new File([blob], 'image.png', { type: blob.type })

            if (!file.type.startsWith('image/')) {
              reject('Please select an image file')
              return
            }

            // Show progress
            progress(0)

            const result = await uploadFile(file, {
              bucket,
              folder,
              allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
              maxSizeInMB: 10
            })

            progress(100)
            toast.success('Image uploaded to cloud storage!')
            resolve(result.url)
          } catch (error) {
            console.error('Cloud storage upload error:', error)
            reject('Cloud storage upload failed')
          }
        }

        uploadAsync()
      })
    },
    [uploadFile, bucket, folder]
  )

  // Custom file picker for images
  const handleFilePicker = useCallback(
    (callback: (url: string, meta?: {alt?: string}) => void, value: string, meta: unknown) => {
      // Type guard for meta
      if (
        meta &&
        typeof meta === 'object' &&
        'filetype' in meta &&
        (meta as {filetype: string}).filetype === 'image'
      ) {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')

        input.addEventListener('change', async (e: Event) => {
          const target = e.target as HTMLInputElement
          const file = target.files?.[0]
          if (!file) return

          if (isUploading) {
            toast.error('Please wait for current upload to complete')
            return
          }

          try {
            const result = await uploadFile(file, {
              bucket,
              folder,
              allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
              maxSizeInMB: 10
            })

            callback(result.url, { alt: file.name })
            toast.success('Image uploaded to cloud storage!')
          } catch (error) {
            console.error('Cloud storage upload error:', error)
            toast.error('Cloud storage upload failed')
          }
        })

        input.click()
      }
    },
    [uploadFile, isUploading, bucket, folder]
  )

  const handleEditorChange = useCallback(
    (content: string) => {
      onChange(content)
    },
    [onChange]
  )

  // Create upload configuration
  const uploadConfig: TinyMCEUploadConfig = {
    bucket,
    folder,
    uploadHandler: handleImageUpload,
    filePickerCallback: handleFilePicker
  }

  // Get TinyMCE configuration
  const editorConfig = getTinyMCEConfig(uploadConfig, height)

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          {label} {required && <span className='text-red-500'>*</span>}
        </label>
      )}

      <div
        className={`rounded-lg overflow-hidden ${error ? 'ring-2 ring-red-300' : ''} ${disabled ? 'opacity-75' : ''}`}
      >
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          onInit={(evt, editor) => {
            editorRef.current = editor
          }}
          value={content}
          onEditorChange={handleEditorChange}
          disabled={disabled}
          init={{
            ...editorConfig,
            placeholder
          }}
        />
      </div>

      {error && (
        <div className='flex items-center mt-1 text-sm text-red-600'>
          <AlertCircle className='w-4 h-4 mr-1' />
          {error}
        </div>
      )}

      {content && (
        <div className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
          {content.replace(/<[^>]*>/g, '').length} characters • Cloud storage: {bucket}/{folder}
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
