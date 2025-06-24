import React, { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import type { Post, PostInsert } from '../types'
import Select from './Select'
import RichTextEditor from './RichTextEditor'
import { useTranslation } from '../hooks/useTranslation'

interface PostFormProps {
  post?: Post | null;
  onSubmit: (data: PostInsert) => void;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  content?: string;
  type?: string;
}

const PostForm: React.FC<PostFormProps> = ({ post, onSubmit, onCancel }) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<PostInsert>({
    title: '',
    content: '',
    type: 'news',
    status: 'draft'
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        type: post.type,
        content: post.content || '',
        status: post.status
      })
    }
  }, [post])

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
        type: formData.type,
        status: formData.status || 'draft'
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
          placeholder="Enter a compelling title..."
          disabled={isSubmitting}
        />
        {errors.title && (
          <div className="flex items-center mt-1 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.title}
          </div>
        )}
      </div>

      {/* Type */}
      <div>
        <Select
          label="Type"
          required
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value as Post['type'] })}
          options={[
            { value: 'news', label: '📰 News' },
            { value: 'event', label: '📅 Event' },
            { value: 'terms_of_use', label: '📋 Terms of Use' },
            { value: 'privacy_policy', label: '🔒 Privacy Policy' }
          ]}
          disabled={isSubmitting}
        />
      </div>

      {/* Status */}
      <div>
        <Select
          label="Status"
          required
          value={formData.status || 'draft'}
          onChange={(value) => setFormData({ ...formData, status: value as Post['status'] })}
          options={[
            { value: 'draft', label: `📝 ${t('draft')}` },
            { value: 'published', label: `✅ ${t('published')}` }
          ]}
          disabled={isSubmitting}
        />
      </div>

      {/* Content */}
      <div>
        <RichTextEditor
          label="Content"
          required
          content={formData.content || ''}
          onChange={(content) => {
            setFormData({ ...formData, content })
            // Clear errors when user starts typing
            if (errors.content) {
              const newErrors = { ...errors }
              delete newErrors.content
              setErrors(newErrors)
            }
          }}
          placeholder="Write your post content here..."
          error={errors.content}
          disabled={isSubmitting}
        />
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {post ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{post ? 'Update' : 'Create'} Post</>
          )}
        </button>
      </div>
    </form>
  )
}

export default PostForm
