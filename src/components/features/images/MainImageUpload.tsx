import React, { useState, useRef, useCallback } from 'react'
import { Upload, Image as ImageIcon, Camera, Trash2 } from 'lucide-react'
import { useFileUpload, type UploadResult } from '../../../hooks/useFileUpload'
import { useToast } from '../../../hooks/useToast'
import { useTranslation } from '../../../hooks/useTranslation'
import { useImageValidation } from '../../../hooks/useImageValidation'

interface MainImageUploadProps {
  /** Current image URL */
  imageUrl?: string | null
  /** Callback when image is uploaded or changed */
  onChange: (result: UploadResult | null, file?: File) => void
  /** Storage bucket for uploads */
  bucket: string
  /** Storage folder for uploads */
  folder?: string
  /** Alt text for the image */
  alt?: string
  /** Label for the upload area */
  label?: string
  /** Size of the image preview */
  size?: 'sm' | 'md' | 'lg'
  /** Whether the component is disabled */
  disabled?: boolean
  /** Custom className for styling */
  className?: string
  /** Recommendation text for large size */
  recommendationText?: string
}

const MainImageUpload: React.FC<MainImageUploadProps> = ({
  imageUrl,
  onChange,
  bucket,
  folder = 'main-images',
  alt = 'Main image',
  label = 'Main Image',
  size = 'md',
  disabled = false,
  className = '',
  recommendationText = 'Recommended: Square images work best'
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFile, isUploading, progress } = useFileUpload()
  const toast = useToast()
  const { t: tCommon } = useTranslation()

  // Validate the provided image URL
  const { isValid: isImageValid } = useImageValidation(imageUrl)

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-20 h-20',
      uploadArea: 'w-20 h-20',
      padding: 'p-2',
      icon: 'w-4 h-4',
      text: 'text-xs',
      spacing: 'space-y-1'
    },
    md: {
      container: 'w-32 h-32',
      uploadArea: 'w-32 h-32',
      padding: 'p-3',
      icon: 'w-6 h-6',
      text: 'text-sm',
      spacing: 'space-y-2'
    },
    lg: {
      container: 'w-full',
      uploadArea: 'w-full h-30',
      padding: 'p-4',
      icon: 'w-5 h-5',
      text: 'text-sm',
      spacing: 'space-y-1'
    }
  }

  const config = sizeConfig[size]

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('fileType')
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('fileSize')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = e => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      uploadFile(file, {
        bucket,
        folder,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        maxSizeInMB: 10
      })
        .then(result => {
          onChange(result, file)
          setPreview(null)
          toast.success('uploaded', 'mainImage')
        })
        .catch(error => {
          console.error('Upload error:', error)
          setPreview(null)
        })
    },
    [uploadFile, bucket, folder, onChange, toast]
  )

  // Handle drag events
  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled || isUploading) return

      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    },
    [disabled, isUploading]
  )

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled || isUploading) return

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0])
      }
    },
    [handleFileSelect, disabled, isUploading]
  )

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0])
      }
    },
    [handleFileSelect]
  )

  // Handle remove image
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (disabled || isUploading) return
      onChange(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onChange, disabled, isUploading]
  )

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (disabled || isUploading) return
    fileInputRef.current?.click()
  }, [disabled, isUploading])

  const currentImage = preview || (isImageValid ? imageUrl : null)
  const showRemoveButton = currentImage && !isUploading

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
        {label}
        {isUploading && (
          <span className='ml-2 text-xs text-blue-600 dark:text-blue-400'>Uploading... {progress}%</span>
        )}
      </label>

      <div className={`relative ${config.container}`}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleInputChange}
          className='hidden'
          disabled={disabled || isUploading}
        />

        {/* Image preview or upload area */}
        {currentImage ? (
          <div className='relative group'>
            <img
              src={currentImage}
              alt={alt}
              className={`${config.container} object-cover rounded-lg border-2 border-gray-200 transition-opacity ${
                isUploading ? 'opacity-50' : 'opacity-100'
              }`}
              onError={(e) => {
                // Hide broken images by setting display to none
                e.currentTarget.style.display = 'none'
                // Optionally, you could also call onChange(null) to clear the broken image
                // onChange(null)
              }}
              onLoad={(e) => {
                // Ensure image is visible when it loads successfully
                e.currentTarget.style.display = 'block'
              }}
            />

            {/* Upload progress overlay */}
            {isUploading && (
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg'>
                <div className='text-white text-center'>
                  <Upload className='w-6 h-6 mx-auto mb-1 animate-pulse' />
                  <div className='text-xs'>{progress}%</div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!isUploading && (
              <div
                className='absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300'
                style={{
                  background: 'rgba(0, 0, 0, 0)',
                  backdropFilter: 'blur(0px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
                  e.currentTarget.style.backdropFilter = 'blur(4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0)'
                  e.currentTarget.style.backdropFilter = 'blur(0px)'
                }}
              >
                <div className='flex space-x-2'>
                  <button
                    type='button'
                    onClick={handleClick}
                    disabled={disabled}
                    className='p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50'
                                            title={tCommon('ui.accessibility.changeImage')}
                  >
                    <Camera className='w-4 h-4 text-gray-600 dark:text-gray-300' />
                  </button>
                  {showRemoveButton && (
                    <button
                      type='button'
                      onClick={handleRemove}
                      disabled={disabled}
                      className='p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50'
                                                title={tCommon('ui.accessibility.removeImage')}
                    >
                      <Trash2 className='w-4 h-4 text-red-600 dark:text-red-400' />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`${config.uploadArea} ${config.padding} border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : disabled || isUploading
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className={`flex flex-col items-center ${config.spacing}`}>
              <ImageIcon className={`${config.icon} text-gray-400 dark:text-gray-500`} />
              <div className='text-center'>
                <span className={`${config.text} text-gray-600 dark:text-gray-300 font-medium block`}>
                  {size === 'lg' ? 'Click to upload' : 'Upload'}
                </span>
                {size === 'lg' && (
                  <span className={`${config.text} text-gray-500 dark:text-gray-400 block`}>or drag & drop</span>
                )}
              </div>
              {size === 'lg' && <span className='text-xs text-gray-500 dark:text-gray-400'>PNG, JPG up to 10MB</span>}
            </div>
          </div>
        )}
      </div>

      {/* Compact hint for large size only */}
      {size === 'lg' && <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>{recommendationText}</p>}
    </div>
  )
}

export default MainImageUpload
