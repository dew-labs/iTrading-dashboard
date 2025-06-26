import React, { useRef, useCallback } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { AlertCircle } from 'lucide-react'
import { useFileUpload } from '../hooks/useFileUpload'
import { toast } from '../utils/toast'

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
  className = ''
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null)
  const { uploadFile, isUploading } = useFileUpload()

  // Custom image upload handler
  const handleImageUpload = useCallback((blobInfo: unknown, progress: (percent: number) => void) => {
    return new Promise<string>((resolve, reject) => {
      const uploadAsync = async () => {
        try {
          // Type guard for blobInfo
          if (!blobInfo || typeof blobInfo !== 'object' || !('blob' in blobInfo)) {
            reject('Invalid blob info')
            return
          }

          const blob = (blobInfo as { blob: () => Blob }).blob()
          const file = blob instanceof File ? blob : new File([blob], 'image.png', { type: blob.type })

          if (!file.type.startsWith('image/')) {
            reject('Please select an image file')
            return
          }

          // Show progress
          progress(0)

          const result = await uploadFile(file, {
            bucket: 'posts',
            folder: 'images',
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            maxSizeInMB: 10
          })

          progress(100)
          toast.success('Image uploaded successfully!')
          resolve(result.url)
        } catch (error) {
          console.error('Image upload error:', error)
          reject('Image upload failed')
        }
      }

      uploadAsync()
    })
  }, [uploadFile])

  // Custom file picker for images
  const handleFilePicker = useCallback((callback: (url: string, meta?: { alt?: string }) => void, value: string, meta: unknown) => {
    // Type guard for meta
    if (meta && typeof meta === 'object' && 'filetype' in meta && (meta as { filetype: string }).filetype === 'image') {
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
            bucket: 'posts',
            folder: 'images',
            allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            maxSizeInMB: 10
          })

          callback(result.url, { alt: file.name })
          toast.success('Image uploaded successfully!')
        } catch (error) {
          console.error('Image upload error:', error)
          toast.error('Image upload failed')
        }
      })

      input.click()
    }
  }, [uploadFile, isUploading])

  const handleEditorChange = useCallback((content: string) => {
    onChange(content)
  }, [onChange])

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className={`rounded-lg overflow-hidden ${error ? 'ring-2 ring-red-300' : ''} ${disabled ? 'opacity-75' : ''}`}>
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          onInit={(evt, editor) => {
            editorRef.current = editor
          }}
          value={content}
          onEditorChange={handleEditorChange}
          disabled={disabled}
          init={{
            height: 300,
            menubar: false,
            placeholder,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic underline strikethrough | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | link image | code',
            content_style: `
              body {
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
              }
              h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; }
              h2 { font-size: 1.5em; font-weight: 600; margin: 0.75em 0; }
              h3 { font-size: 1.25em; font-weight: 600; margin: 0.83em 0; }
              blockquote {
                border-left: 4px solid #d1d5db;
                padding-left: 16px;
                margin: 16px 0;
                font-style: italic;
                color: #6b7280;
                background-color: #f9fafb;
                padding: 12px 16px;
                border-radius: 0 4px 4px 0;
              }
              pre {
                background-color: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                padding: 12px;
                margin: 12px 0;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 13px;
                overflow-x: auto;
              }
              img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 12px 0;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              a {
                color: #3b82f6;
                text-decoration: underline;
              }
              a:hover {
                color: #1d4ed8;
              }
            `,
            skin: 'oxide',
            content_css: 'default',
            branding: false,
            promotion: false,
            resize: false,
            statusbar: false,
            // Image upload configuration
            images_upload_handler: handleImageUpload,
            file_picker_callback: handleFilePicker,
            file_picker_types: 'image',
            automatic_uploads: false, // Disable automatic uploads
            // Paste configuration
            paste_data_images: true,
            paste_as_text: false,
            // Link configuration
            link_default_target: '_blank',
            link_default_protocol: 'https',
            // Other configurations
            entity_encoding: 'raw',
            extended_valid_elements: 'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name]',
            valid_children: '+body[style],+div[div|p|br|span|img|strong|em|a|ul|ol|li|h1|h2|h3|h4|h5|h6|blockquote|pre|code]'
          }}
        />
      </div>

      {error && (
        <div className="flex items-center mt-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}

      {content && (
        <div className="mt-1 text-sm text-gray-500">
          {content.replace(/<[^>]*>/g, '').length} characters
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
