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
