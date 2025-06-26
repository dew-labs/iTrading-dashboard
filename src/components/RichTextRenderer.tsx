import React from 'react'

interface RichTextRendererProps {
  content?: string | null
  className?: string
  fallback?: React.ReactNode
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = '',
  fallback = <span className="text-gray-500 italic">No content available</span>
}) => {
  if (!content || content.trim() === '') {
    return <>{fallback}</>
  }

  // Clean and sanitize the HTML content
  const cleanContent = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/on\w+='[^']*'/gi, '') // Remove event handlers (single quotes)

  const proseClasses = [
    'prose prose-sm max-w-none',
    'prose-headings:text-gray-900 prose-headings:font-semibold',
    'prose-h1:text-xl prose-h1:mb-4',
    'prose-h2:text-lg prose-h2:mb-3',
    'prose-h3:text-base prose-h3:mb-3',
    'prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3',
    'prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800',
    'prose-strong:text-gray-900 prose-strong:font-semibold',
    'prose-em:text-gray-700 prose-em:italic',
    'prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4',
    'prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4',
    'prose-li:text-gray-700 prose-li:mb-1',
    'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600',
    'prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono',
    'prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto',
    'prose-img:rounded-lg prose-img:shadow-sm',
    'prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-gray-300',
    'prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold',
    'prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2',
    className
  ].filter(Boolean).join(' ')

  return (
    <div
      className={proseClasses}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  )
}

export default RichTextRenderer
