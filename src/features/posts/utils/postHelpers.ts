// Posts Feature - Utility Functions
import type { PostWithAuthor } from '../api/types'

/**
 * Get post status badge variant
 */
export const getPostStatusVariant = (status: PostWithAuthor['status']) => {
  switch (status) {
  case 'published':
    return 'success'
  case 'draft':
    return 'warning'
  default:
    return 'gray'
  }
}

/**
 * Get post type display text
 */
export const getPostTypeText = (type: PostWithAuthor['type']) => {
  switch (type) {
  case 'news':
    return 'News'
  case 'event':
    return 'Event'
  case 'terms_of_use':
    return 'Terms of Use'
  case 'privacy_policy':
    return 'Privacy Policy'
  default:
    return type
  }
}

/**
 * Calculate reading time estimate
 */
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}
