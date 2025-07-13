/**
 * Helper function to strip HTML tags and create plain text for table display
 */
export const stripHtmlAndTruncate = (html: string, maxLength: number = 100): string => {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '')
  // Decode HTML entities
  const decoded = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')

  // Trim and truncate
  const trimmed = decoded.trim()
  return trimmed.length > maxLength ? `${trimmed.substring(0, maxLength)}...` : trimmed
}

/**
 * Strips HTML tags and decodes HTML entities, returns plain text (no truncation)
 */
export const stripHtml = (html: string): string => {
  const text = html.replace(/<[^>]*>/g, '')
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

/**
 * Calculate reading time in minutes based on content
 * @param content - The text content (can include HTML)
 * @param wordsPerMinute - Average reading speed (default: 200 words/minute)
 * @returns Reading time in minutes (minimum 1 minute)
 */
export const calculateReadingTime = (content: string, wordsPerMinute: number = 200): number => {
  if (!content || content.trim() === '') {
    return 1
  }

  // Strip HTML tags from content
  const plainText = content.replace(/<[^>]*>/g, '')

  // Count words (split by whitespace and filter out empty strings)
  const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length

  // Calculate reading time in minutes, with minimum of 1 minute
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}
