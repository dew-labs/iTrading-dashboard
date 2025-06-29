import React from 'react'
import { AlertCircle, FileText, Calendar, Scale, Lock, Clock, CheckCircle, Save, X, Plus } from 'lucide-react'
import type { PostInsert } from '../../../types'
import type { PostWithAuthor } from '../../../hooks/usePosts'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { FormField } from '../../atoms'
import { Select } from '../../molecules'
import RichTextEditor from './RichTextEditor'
import { MainImageUpload } from '../images'
import { useAuth } from '../../../hooks/useAuth'

interface PostFormProps {
  post?: PostWithAuthor | null
  onSubmit: (data: PostInsert) => void
  onCancel: () => void
}

const PostForm: React.FC<PostFormProps> = ({ post, onSubmit, onCancel }) => {
  const { user } = useAuth()

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
  } = useFormValidation<{
    title: string
    content: string
    type: PostWithAuthor['type']
    status: PostWithAuthor['status']
    author_id: string | null
    thumbnail_url: string | null
    views: number
  }>({
    schema: {
      title: {
        required: true,
        minLength: 3,
        maxLength: 200,
        message: 'Title must be between 3 and 200 characters'
      },
      content: {
        required: true,
        minLength: 10,
        message: 'Content must be at least 10 characters'
      }
    },
    initialData: {
      title: '',
      content: '',
      type: 'news',
      status: 'draft',
      author_id: user?.id || null,
      thumbnail_url: null,
      views: 0
    },
    validateOnBlur: true,
    validateOnChange: false
  })

  React.useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        type: post.type,
        content: post.content || '',
        status: post.status,
        author_id: post.author_id || user?.id || null,
        thumbnail_url: post.thumbnail_url || null,
        views: post.views || 0
      })
    }
  }, [post, user?.id, reset])

  const handleContentChange = (content: string) => {
    updateField('content', content)
  }

  const handleThumbnailChange = (url: string | null) => {
    updateField('thumbnail_url', url)
  }

  // Create type options with Badge component icons
  const typeOptions = [
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
  ]

  // Create status options with Badge component icons
  const statusOptions = [
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
  ]

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as PostInsert))} className='space-y-6'>
      {/* Title field - full width for emphasis using enhanced FormField */}
      <FormField
        label='Title'
        name='title'
        value={formData.title}
        onChange={handleChange('title')}
        onBlur={handleBlur('title')}
        placeholder='Enter a compelling title...'
        required
        disabled={isValidating}
        {...(errors.title && { error: errors.title })}
        icon={<FileText className='w-5 h-5' />}
        helperText='Choose a clear, descriptive title that accurately represents your content'
      />

      {/* Enhanced layout for larger modal */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left column - Metadata and thumbnail */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Type and Status in vertical layout for better spacing */}
          <div className='space-y-4'>
            <Select
              label='Type'
              required
              value={formData.type || 'news'}
              onChange={value => updateField('type', value as PostWithAuthor['type'])}
              options={typeOptions}
              disabled={isValidating}
            />

            <Select
              label='Status'
              required
              value={formData.status || 'draft'}
              onChange={value => updateField('status', value as PostWithAuthor['status'])}
              options={statusOptions}
              disabled={isValidating}
            />
          </div>

          {/* Thumbnail upload section */}
          <div className='border-t border-gray-200 dark:border-gray-700 pt-6'>
            <MainImageUpload
              label='Thumbnail Image'
              imageUrl={formData.thumbnail_url || null}
              onChange={handleThumbnailChange}
              bucket='posts'
              folder='thumbnails'
              size='lg'
              disabled={isValidating}
              recommendationText='Use high-quality images (1200x630px) for best social sharing results'
              alt='Post thumbnail'
            />
          </div>
        </div>

        {/* Right column - Content editor */}
        <div className='lg:col-span-2'>
          <div className='space-y-2'>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Content <span className='text-red-500'>*</span>
            </label>
            <RichTextEditor
              content={formData.content || ''}
              onChange={handleContentChange}
              placeholder='Write your post content here - use the rich editor tools to format your text...'
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
          Cancel
        </button>
        <button
          type='submit'
          disabled={isValidating}
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
        >
          {isValidating ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-b-gray-900 mr-2'></div>
              {post ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {post ? (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  Update Post
                </>
              ) : (
                <>
                  <Plus className='w-4 h-4 mr-2' />
                  Create Post
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
