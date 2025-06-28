import React, { useState, useEffect } from 'react'
import { AlertCircle, FileText, Calendar, Scale, Lock, Clock, CheckCircle, Save, X, Plus } from 'lucide-react'
import type { PostInsert } from '../types'
import type { PostWithAuthor } from '../hooks/usePosts'
import Select from './Select'
import RichTextEditor from './RichTextEditor'
import MainImageUpload from './MainImageUpload'
import { useAuth } from '../hooks/useAuth'

interface PostFormProps {
  post?: PostWithAuthor | null
  onSubmit: (data: PostInsert) => void
  onCancel: () => void
}

interface FormErrors {
  title?: string
  content?: string
  type?: string
}

const PostForm: React.FC<PostFormProps> = ({ post, onSubmit, onCancel }) => {
  const { user } = useAuth()

  const [formData, setFormData] = useState<PostInsert>({
    title: '',
    content: '',
    type: 'news',
    status: 'draft',
    author_id: user?.id || null,
    thumbnail_url: null,
    views: 0
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        type: post.type,
        content: post.content || '',
        status: post.status,
        author_id: post.author_id || user?.id || null,
        thumbnail_url: post.thumbnail_url || null,
        views: post.views || 0
      })
    }
  }, [post, user?.id])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }

    // Content validation
    if (!formData.content?.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare data for submission
      const submitData: PostInsert = {
        title: formData.title.trim(),
        content: formData.content?.trim() || '',
        type: formData.type || 'news',
        status: formData.status || 'draft',
        author_id: formData.author_id || user?.id || null,
        thumbnail_url: formData.thumbnail_url || null,
        views: formData.views || 0
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Clear errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      })
    }
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
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Title field - full width for emphasis */}
      <div>
        <label htmlFor='title' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
          Title *
        </label>
        <input
          type='text'
          id='title'
          name='title'
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${
            errors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
          } rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:border-transparent`}
          placeholder='Enter a compelling title...'
          disabled={isSubmitting}
        />
        {errors.title && (
          <div className='flex items-center mt-1 text-sm text-red-600'>
            <AlertCircle className='w-4 h-4 mr-1' />
            {errors.title}
          </div>
        )}
      </div>

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
              onChange={value => setFormData({ ...formData, type: value as PostWithAuthor['type'] })}
              options={typeOptions}
              disabled={isSubmitting}
            />

            <Select
              label='Status'
              required
              value={formData.status || 'draft'}
              onChange={value => setFormData({ ...formData, status: value as PostWithAuthor['status'] })}
              options={statusOptions}
              disabled={isSubmitting}
            />
          </div>

          {/* Thumbnail upload section */}
          <div className='border-t border-gray-200 dark:border-gray-700 pt-6'>
            <MainImageUpload
              label='Thumbnail Image'
              imageUrl={formData.thumbnail_url || null}
              onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
              bucket='posts'
              folder='thumbnails'
              size='lg'
              disabled={isSubmitting}
              recommendationText='Use high-quality images (1200x630px) for best social sharing results'
              alt='Post thumbnail'
            />
          </div>
        </div>

        {/* Right column - Content editor */}
        <div className='lg:col-span-2'>
          <RichTextEditor
            label='Content'
            required
            content={formData.content || ''}
            onChange={content => {
              setFormData({ ...formData, content })
              // Clear errors when user starts typing
              if (errors.content) {
                const newErrors = { ...errors }
                delete newErrors.content
                setErrors(newErrors)
              }
            }}
            placeholder='Write your post content here - use the rich editor tools to format your text...'
            error={errors.content}
            disabled={isSubmitting}
            height={500}
            bucket='posts'
            folder='images'
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center'
          disabled={isSubmitting}
        >
          <X className='w-4 h-4 mr-2' />
          Cancel
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
        >
          {isSubmitting ? (
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
