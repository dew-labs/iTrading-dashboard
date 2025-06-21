import React, { useState, useEffect } from 'react'
import { FileText, AlertCircle } from 'lucide-react'
import type { Post, PostInsert } from '../types'

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
  const [formData, setFormData] = useState<PostInsert>({
    title: '',
    content: '',
    type: 'news'
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        type: post.type,
        content: post.content || ''
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
        type: formData.type
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
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Type *
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          disabled={isSubmitting}
        >
          <option value="news">📰 News</option>
          <option value="event">📅 Event</option>
          <option value="terms_of_use">📋 Terms of Use</option>
          <option value="privacy_policy">🔒 Privacy Policy</option>
        </select>
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          <FileText className="w-4 h-4 inline mr-1" />
          Content *
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content || ''}
          onChange={handleChange}
          rows={10}
          className={`w-full px-3 py-2 border ${
            errors.content ? 'border-red-300' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
          placeholder="Write your post content here..."
          disabled={isSubmitting}
        />
        {errors.content && (
          <div className="flex items-center mt-1 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.content}
          </div>
        )}
        <div className="mt-1 text-sm text-gray-500">{formData.content?.length || 0} characters</div>
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
