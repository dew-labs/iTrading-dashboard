import React from 'react'

interface RichTextRendererProps {
  content?: string | null
  className?: string
  fallback?: React.ReactNode
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = '',
  fallback = <span className='text-gray-500 italic'>No content available</span>
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

  // Use a simple approach with direct CSS classes that override any default text colors
  const containerClasses = [
    'prose prose-lg max-w-none',
    'text-gray-900 dark:text-gray-100', // Direct text color override
    '[&_h1]:text-gray-900 [&_h1]:dark:text-gray-100 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mb-4',
    '[&_h2]:text-gray-900 [&_h2]:dark:text-gray-100 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3',
    '[&_h3]:text-gray-900 [&_h3]:dark:text-gray-100 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-3',
    '[&_h4]:text-gray-900 [&_h4]:dark:text-gray-100 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mb-2',
    '[&_h5]:text-gray-900 [&_h5]:dark:text-gray-100 [&_h5]:text-sm [&_h5]:font-semibold [&_h5]:mb-2',
    '[&_h6]:text-gray-900 [&_h6]:dark:text-gray-100 [&_h6]:text-sm [&_h6]:font-semibold [&_h6]:mb-2',
    '[&_p]:text-gray-700 [&_p]:dark:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-3',
    '[&_span]:text-gray-700 [&_span]:dark:text-gray-300',
    '[&_div]:text-gray-700 [&_div]:dark:text-gray-300',
    '[&_li]:text-gray-700 [&_li]:dark:text-gray-300 [&_li]:mb-1',
    '[&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline hover:[&_a]:text-blue-800 hover:[&_a]:dark:text-blue-300',
    '[&_strong]:text-gray-900 [&_strong]:dark:text-gray-100 [&_strong]:font-semibold',
    '[&_b]:text-gray-900 [&_b]:dark:text-gray-100 [&_b]:font-semibold',
    '[&_em]:text-gray-700 [&_em]:dark:text-gray-300 [&_em]:italic',
    '[&_i]:text-gray-700 [&_i]:dark:text-gray-300 [&_i]:italic',
    '[&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4',
    '[&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4',
    '[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:dark:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:dark:text-gray-400',
    '[&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:text-gray-900 [&_code]:dark:text-gray-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono',
    '[&_pre]:bg-gray-900 [&_pre]:dark:bg-gray-800 [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto',
    '[&_img]:rounded-lg [&_img]:shadow-sm',
    '[&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-300 [&_table]:dark:border-gray-600',
    '[&_th]:border [&_th]:border-gray-300 [&_th]:dark:border-gray-600 [&_th]:bg-gray-50 [&_th]:dark:bg-gray-800 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-900 [&_th]:dark:text-gray-200',
    '[&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:px-4 [&_td]:py-2 [&_td]:text-gray-700 [&_td]:dark:text-gray-300',
    className
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={containerClasses} dangerouslySetInnerHTML={{ __html: cleanContent }} />
}

export default RichTextRenderer
