import React, { useState, useMemo, useCallback } from 'react'
import { Image as ImageIcon, Upload, Camera, Trash2, X, Save, Plus, Link } from 'lucide-react'
import type { Banner, BannerInsert } from '../../../types'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField } from '../../atoms'
import { useImages } from '../../../hooks/useImages'
import { useFileUpload } from '../../../hooks/useFileUpload'
import { useToast } from '../../../hooks/useToast'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'
import { getStorageUrl } from '../../../utils/storage'

// Move schema outside component to prevent re-renders
const BANNER_FORM_SCHEMA = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Banner name must be between 2 and 100 characters'
  },
  target_url: {
    required: true,
    custom: (value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message: 'Please enter a valid URL'
  }
} as const

interface BannerFormProps {
  banner?: Banner | null
  onSubmit: (data: BannerInsert, imageUploadResult?: {
    url: string
    path: string
    id: string
    file?: File
  }) => void
  onCancel: () => void
}

const BannerForm: React.FC<BannerFormProps> = ({ banner, onSubmit, onCancel }) => {
  // Memoize initial data to prevent re-renders
  const initialData = useMemo(() => ({
    name: '',
    target_url: '',
    is_visible: false
  }), [])

  // Enhanced form validation with our new hook
  const {
    data: formData,
    errors,
    isValidating,
    updateField,
    handleBlur,
    handleChange,
    handleSubmit,
    reset
  } = useFormValidation({
    schema: BANNER_FORM_SCHEMA,
    initialData,
    validateOnBlur: true,
    validateOnChange: false
  })

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<{
    url: string
    path: string
    id: string
    file?: File
  } | null>(null)

  const { createImageFromUpload, deleteImage, isCreating: isCreatingImage } = useImages()
  const { uploadFile, isUploading, progress } = useFileUpload()
  const toast = useToast()
  const { t: tForm } = useFormTranslation()
  const { t: tCommon } = useTranslation()

  // Load existing banner image if editing (only when we have a banner ID)
  const { images: existingImages } = useImages(
    banner?.id ? 'banners' : undefined,
    banner?.id || undefined
  )

  // Memoize the first existing image to prevent re-renders
  const existingImage = useMemo(() =>
    existingImages?.[0] || null,
    [existingImages]
  )

  React.useEffect(() => {
    if (banner) {
      reset({
        name: banner.name || '',
        target_url: banner.target_url || '',
        is_visible: !!banner.is_visible
      })
    }
  }, [banner, reset])

  // Separate effect for loading existing image to prevent infinite loops
  React.useEffect(() => {
    if (banner?.id && existingImage) {
      setImageUrl(getStorageUrl(existingImage.table_name, existingImage.path))
    }
  }, [banner?.id, existingImage])

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
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

    try {
      // Upload file
      const result = await uploadFile(file, {
        bucket: 'banners',
        folder: 'main-images',
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        maxSizeInMB: 10
      })

      setImageUrl(result.url)
      setPreview(null)
      setUploadResult({ ...result, file })
      toast.success('uploaded', 'image')

      // If editing an existing banner, create the image record immediately
      if (banner?.id) {
        await createImageFromUpload(
          'banners',
          banner.id,
          result,
          `Banner ${banner.id.slice(0, 8)} image`,
          file.size,
          file.type
        )
      }
    } catch (error) {
      console.error('Upload error:', error)
      setPreview(null)
    }
  }, [banner?.id, uploadFile, createImageFromUpload, toast])

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isUploading) return

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (isUploading) return

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  // Handle remove image
  const handleRemove = useCallback(async () => {
    if (isUploading) return

    setImageUrl(null)
    setPreview(null)
    setUploadResult(null)

    // If editing and there's an existing image, delete it
    if (banner?.id && existingImage) {
      try {
        await deleteImage(existingImage.id)
        toast.success('deleted', 'image')
      } catch (error) {
        console.error('Failed to delete image:', error)
      }
    }
  }, [banner?.id, existingImage, isUploading, deleteImage, toast])

  // Handle click to open file dialog
  const handleClick = () => {
    if (isUploading) return
    document.getElementById('banner-file-input')?.click()
  }

  const handleFormSubmit = useCallback(async (data: typeof formData) => {
    const currentImage = preview || imageUrl

    // Validate that image is provided
    if (!banner && !currentImage && !uploadResult) {
      toast.error('required', null, 'Please upload a banner image')
      return
    }

    if (banner && !currentImage) {
      toast.error('required', null, 'Please upload a banner image')
      return
    }

    try {
      // Create/update the banner and pass image upload result for new banners
      await onSubmit(data, uploadResult || undefined)
    } catch (error) {
      console.error('Failed to save banner:', error)
    }
  }, [banner, preview, imageUrl, uploadResult, onSubmit, toast])

  const currentImage = preview || imageUrl
  const showRemoveButton = currentImage && !isUploading

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      {/* Banner Name using enhanced FormField */}
      <FormField
        label='Banner Name'
        name='name'
        value={formData.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        placeholder={tForm('placeholders.bannerName')}
        required
        disabled={isValidating || isUploading || isCreatingImage}
        {...(errors.name && { error: errors.name })}
        icon={<ImageIcon className='w-5 h-5' />}
        helperText='A clear name to identify this banner in your dashboard'
      />

      {/* Image Upload Section */}
      <div className='space-y-2'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
          Banner Image <span className='text-red-500'>*</span>
          {isUploading && (
            <span className='ml-2 text-xs text-blue-600 dark:text-blue-400'>
              Uploading... {progress}%
            </span>
          )}
        </label>

        <div className='relative'>
          {/* Hidden file input */}
          <input
            id='banner-file-input'
            type='file'
            accept='image/*'
            onChange={handleInputChange}
            className='hidden'
            disabled={isUploading}
          />

          {/* Image preview or upload area */}
          {currentImage ? (
            <div className='relative group'>
              <img
                src={currentImage}
                alt='Banner preview'
                className={`w-full h-32 object-cover rounded-lg border-2 border-gray-200 transition-opacity ${
                  isUploading ? 'opacity-50' : 'opacity-100'
                }`}
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
                      className='p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                      title={tCommon('ui.accessibility.changeImage')}
                    >
                      <Camera className='w-4 h-4 text-gray-600 dark:text-gray-300' />
                    </button>
                    {showRemoveButton && (
                      <button
                        type='button'
                        onClick={handleRemove}
                        className='p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
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
              className={`w-full h-32 p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : isUploading
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <div className='flex flex-col items-center space-y-2'>
                <ImageIcon className='w-6 h-6 text-gray-400 dark:text-gray-500' />
                <div className='text-center'>
                  <span className='text-sm text-gray-600 dark:text-gray-300 font-medium block'>
                    Click to upload banner image
                  </span>
                  <span className='text-sm text-gray-500 dark:text-gray-400 block'>
                    or drag & drop
                  </span>
                </div>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  PNG, JPG up to 10MB
                </span>
              </div>
            </div>
          )}
        </div>

        <p className='text-xs text-gray-500 dark:text-gray-400'>
          <span className='text-red-500'>Required:</span> Upload a banner image. Recommended: Wide landscape images (16:9 ratio) work best
        </p>
      </div>

      {/* URL Field and Active Status Row */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6'>
        {/* URL Field using enhanced FormField */}
        <div className='lg:col-span-2'>
          <FormField
            label='Target URL'
            type='url'
            name='target_url'
            value={formData.target_url || ''}
            onChange={handleChange('target_url')}
            onBlur={handleBlur('target_url')}
            placeholder={tForm('placeholders.bannerUrl')}
            required
            disabled={isValidating || isUploading || isCreatingImage}
            {...(errors.target_url && { error: errors.target_url })}
            icon={<Link className='w-5 h-5' />}
            helperText='Where users will be redirected when they click the banner'
          />
        </div>

        {/* Active Status Toggle */}
        <div className='lg:col-span-1'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            Banner Status
          </label>
          <div className='flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg h-[42px]'>
            <div className='flex items-center space-x-3'>
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                {formData.is_visible ? 'Active' : 'Inactive'}
              </span>
              <button
                type='button'
                onClick={() => updateField('is_visible', !formData.is_visible)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:ring-offset-2 ${
                  formData.is_visible
                    ? 'bg-teal-600 dark:bg-teal-500'
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
                role='switch'
                aria-checked={!!formData.is_visible}
                aria-labelledby='banner-status-label'
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_visible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
            {formData.is_visible ? 'Banner is visible to users' : 'Banner is hidden'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          className='flex items-center space-x-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
        >
          <X className='w-4 h-4' />
          <span>Cancel</span>
        </button>
        <button
          type='submit'
          disabled={isValidating || isUploading || isCreatingImage || !formData.name.trim() || !formData.target_url?.trim() || (!banner && !currentImage && !uploadResult) || (!!banner && !currentImage)}
          className='flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isUploading || isCreatingImage ? (
            <>
              <Upload className='w-4 h-4 animate-spin' />
              <span>Processing...</span>
            </>
          ) : banner ? (
            <>
              <Save className='w-4 h-4' />
              <span>Update Banner</span>
            </>
          ) : (
            <>
              <Plus className='w-4 h-4' />
              <span>Create Banner</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default BannerForm
