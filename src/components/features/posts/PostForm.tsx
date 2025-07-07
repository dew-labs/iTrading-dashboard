import React, { useMemo, useCallback, useState } from 'react'
import { AlertCircle, FileText, Calendar, Scale, Lock, Clock, CheckCircle, Save, X, Plus } from 'lucide-react'
import type { PostInsert, Image } from '../../../types'
import type { PostWithAuthor } from '../../../hooks/usePosts'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { useFormTranslation, useTranslation } from '../../../hooks/useTranslation'
import { FormField } from '../../atoms'
import { Select } from '../../molecules'
import RichTextEditor from './RichTextEditor'
import { stripHtml } from '../../../utils/textUtils'
import { MainImageUpload } from '../images'
import { supabase } from '../../../lib/supabase'
import type { UploadResult } from '../../../hooks/useFileUpload'

// Move schema outside component to prevent re-renders
const POST_FORM_SCHEMA = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200,
    message: 'Title must be between 3 and 200 characters'
  },
  excerpt: {
    maxLength: 300,
    message: 'Excerpt cannot exceed 300 characters'
  },
  content: {
    required: true,
    minLength: 10,
    message: 'Content must be at least 10 characters'
  }
} as const

interface PostFormProps {
  post?: PostWithAuthor | null
  onSubmit: (
    data: PostInsert,
    thumbnailImage?: (Partial<Image> & { file?: File }) | null
  ) => void
  onCancel: () => void
  images?: Image[] | null
}

// Utility to calculate reading time (words/200, rounded up)
function calculateReadingTime(content: string): number {
  const plainText = stripHtml(content || '')
  const words = plainText.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

const PostForm: React.FC<PostFormProps> = ({ post, onSubmit, onCancel, images }) => {
  const { t: tForm } = useFormTranslation()
  const { t: tCommon } = useTranslation()

  const [thumbnailImage, setThumbnailImage] = useState<
    (Partial<Image> & { publicUrl?: string; file?: File }) | null
  >(null)

  // Memoize initial data to prevent re-renders
  const initialData = useMemo(() => ({
    title: '',
    excerpt: '',
    content: '',
    type: 'news' as PostWithAuthor['type'],
    status: 'draft' as PostWithAuthor['status'],
    author_id: null as string | null,
    views: 0
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
    schema: POST_FORM_SCHEMA,
    initialData,
    validateOnBlur: true,
    validateOnChange: false
  })

  const [readingTime, setReadingTime] = React.useState<number>(
    post?.reading_time ?? calculateReadingTime(post?.content ?? '')
  )

  React.useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        excerpt: post.excerpt || '',
        type: post.type,
        content: post.content || '',
        status: post.status,
        author_id: post.author_id,
        views: post.views || 0
      })
      setReadingTime(calculateReadingTime(post.content || ''))

      const existingThumbnail = images?.find(
        img => img.record_id === post.id && img.type === 'thumbnail'
      )
      if (existingThumbnail) {
        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(existingThumbnail.path)
        setThumbnailImage({ ...existingThumbnail, publicUrl: urlData.publicUrl })
      } else {
        setThumbnailImage(null)
      }
    } else {
      reset(initialData)
      setThumbnailImage(null)
    }
  }, [post, reset, images, initialData])

  React.useEffect(() => {
    setReadingTime(calculateReadingTime(formData.content || ''))
  }, [formData.content])

  const handleContentChange = useCallback((content: string) => {
    updateField('content', content)
  }, [updateField])

  const handleThumbnailUpload = useCallback(
    (uploadResult: UploadResult | null, file?: File) => {
      if (uploadResult && file) {
        const { url: publicUrl, path, id: storageObjectId } = uploadResult
        setThumbnailImage(prev => ({
          ...prev,
          path,
          publicUrl,
          storage_object_id: storageObjectId,
          table_name: 'posts',
          record_id: post?.id || '',
          type: 'thumbnail',
          alt_text: `${formData.title} thumbnail`,
          file_size: file.size,
          mime_type: file.type,
          file
        }))
      } else {
        setThumbnailImage(null)
      }
    },
    [post?.id, formData.title]
  )

  // Create type options with Badge component icons
  const typeOptions = useMemo(() => [
    {
      value: 'news',
      label: 'News',
      icon: <FileText className='w-4 h-4' />
    },
    {
      value: 'event',
      label: 'Event',
      icon: <Calendar className='w-4 h-4' />
    },
    {
      value: 'terms_of_use',
      label: 'Terms of Use',
      icon: <Scale className='w-4 h-4' />
    },
    {
      value: 'privacy_policy',
      label: 'Privacy Policy',
      icon: <Lock className='w-4 h-4' />
    }
  ], [])

  // Create status options with Badge component icons
  const statusOptions = useMemo(() => [
    {
      value: 'draft',
      label: 'Draft',
      icon: <Clock className='w-4 h-4' />
    },
    {
      value: 'published',
      label: 'Published',
      icon: <CheckCircle className='w-4 h-4' />
    }
  ], [])

  const handleFormSubmit = useCallback((data: typeof formData) => {
    onSubmit(
      { ...data, reading_time: calculateReadingTime(data.content || '') } as PostInsert,
      thumbnailImage
    )
  }, [onSubmit, thumbnailImage])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      {/* Title field - full width for emphasis using enhanced FormField */}
      <FormField
        label={tForm('labels.title')}
        name='title'
        value={formData.title}
        onChange={handleChange('title')}
        onBlur={handleBlur('title')}
        placeholder={tForm('placeholders.postTitle')}
        required
        disabled={isValidating}
        {...(errors.title && { error: errors.title })}
        icon={<FileText className='w-5 h-5' />}
        helperText='Choose a clear, descriptive title that accurately represents your content'
      />

      {/* Excerpt field - full width for short summary */}
      <FormField
        label={tForm('labels.excerpt')}
        name='excerpt'
        value={formData.excerpt}
        onChange={handleChange('excerpt')}
        onBlur={handleBlur('excerpt')}
        placeholder={tForm('placeholders.postExcerpt')}
        disabled={isValidating}
        {...(errors.excerpt && { error: errors.excerpt })}
        icon={<FileText className='w-5 h-5' />}
        helperText='A short, enticing summary (max 300 characters) to appear on listing pages'
        maxLength={300}
      />

      {/* Enhanced layout for larger modal */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left column - Metadata and thumbnail */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Type and Status in vertical layout for better spacing */}
          <div className='space-y-4'>
            <Select
              label={tForm('labels.type')}
              required
              value={formData.type || 'news'}
              onChange={value => updateField('type', value as PostWithAuthor['type'])}
              options={typeOptions}
              disabled={isValidating}
            />

            <Select
              label={tForm('labels.status')}
              required
              value={formData.status || 'draft'}
              onChange={value => updateField('status', value as PostWithAuthor['status'])}
              options={statusOptions}
              disabled={isValidating}
            />
          </div>

          {/* Reading time display */}
          <div className='flex items-center space-x-2 mt-4' aria-live='polite'>
            <Clock className='w-4 h-4 text-gray-500 dark:text-gray-400' aria-hidden='true' />
            <span className='text-sm text-gray-700 dark:text-gray-300'>
              {tForm('labels.readingTime')}
            </span>
            <span className='font-semibold text-gray-900 dark:text-white'>{readingTime} min</span>
          </div>

          {/* Thumbnail upload will be handled through the centralized images table */}
          <div className='border-t border-gray-200 dark:border-gray-700 pt-6'>
            <MainImageUpload
              label={tForm('labels.thumbnail')}
              imageUrl={thumbnailImage?.publicUrl || thumbnailImage?.path || null}
              onChange={handleThumbnailUpload}
              bucket='posts'
              folder='thumbnails'
              size='lg'
              disabled={isValidating}
              recommendationText={tForm('hints.thumbnailRecommendation')}
              alt='Post thumbnail'
            />
          </div>
        </div>

        {/* Right column - Content editor */}
        <div className='lg:col-span-2'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              {tForm('labels.content')} <span className='text-red-500'>*</span>
            </label>
            <RichTextEditor
              content={formData.content || ''}
              onChange={handleContentChange}
              placeholder={tForm('placeholders.postContent')}
              disabled={isValidating}
              height={500}
              bucket='posts'
              folder='images'
            />
            {errors.content && (
              <div className='flex items-center space-x-1 text-sm text-red-600 dark:text-red-400'>
                <AlertCircle className='w-4 h-4 flex-shrink-0' />
                <span>{errors.content}</span>
              </div>
            )}
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              Use the rich editor to format your content with headings, lists, links, and media
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center'
          disabled={isValidating}
        >
          <X className='w-4 h-4 mr-2' />
          {tCommon('actions.cancel')}
        </button>
        <button
          type='submit'
          disabled={isValidating}
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
        >
          {isValidating ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-b-gray-900 mr-2'></div>
              {post ? tCommon('feedback.updating') : tCommon('feedback.creating')}
            </>
          ) : (
            <>
              {post ? (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  {tCommon('actions.update')} {tCommon('entities.post')}
                </>
              ) : (
                <>
                  <Plus className='w-4 h-4 mr-2' />
                  {tCommon('actions.create')} {tCommon('entities.post')}
                </>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default PostForm
