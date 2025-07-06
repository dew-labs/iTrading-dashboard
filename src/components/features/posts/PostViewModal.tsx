import React from 'react'
import {
  X,
  Calendar,
  User,
  Clock,
  Eye,
  Tag,
  FileText,
  TrendingUp
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation, usePageTranslation } from '../../../hooks/useTranslation'
import { formatDateDisplay } from '../../../utils/format'
import { Badge, Button } from '../../atoms'
import { RichTextRenderer } from '../../common'
import { RecordImage } from '../images'
import type { PostWithAuthor } from '../../../hooks/usePosts'
import { getTypographyClasses, cn } from '../../../utils/theme'
import { supabase } from '../../../lib/supabase'

interface PostViewModalProps {
  isOpen: boolean
  onClose: () => void
  post: PostWithAuthor
  onEdit?: () => void
}

const PostViewModal: React.FC<PostViewModalProps> = ({
  isOpen,
  onClose,
  post,
  onEdit
}) => {
  const { t: tCommon } = useTranslation()
  const { t } = usePageTranslation()

  // Fetch images for this specific post
  const { data: images = [] } = useQuery({
    queryKey: ['images', 'posts', post.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('images')
        .select('*')
        .eq('table_name', 'posts')
        .eq('record_id', post.id.toString())
      return data || []
    },
    enabled: isOpen // Only fetch when modal is open
  })

  const hasImages = images.length > 0

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Enhanced background overlay */}
      <div
        className='fixed inset-0 backdrop-blur-md bg-black/40 dark:bg-black/60 transition-all duration-300 ease-out'
        onClick={onClose}
      />

      {/* Modal container */}
      <div className='flex min-h-full items-center justify-center p-4'>
        {/* Enhanced modal with better dimensions for content reading */}
        <div className='relative bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 w-full max-w-6xl max-h-[95vh] overflow-hidden transform transition-all duration-300 ease-out scale-100'>

          {/* Enhanced Header with gradient and post meta */}
          <div className='sticky top-0 z-10 bg-gradient-to-r from-gray-50/95 to-white/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-6'>
            <div className='flex items-start justify-between'>
              <div className='flex-1 mr-6'>
                {/* Post badges */}
                <div className='flex items-center space-x-3 mb-3'>
                  <Badge
                    variant={post.status as 'published' | 'draft'}
                    size='sm'
                    showIcon
                  >
                    {tCommon(`status.${post.status}`)}
                  </Badge>
                  <Badge
                    variant={post.type as 'news' | 'event' | 'terms_of_use' | 'privacy_policy'}
                    size='sm'
                    showIcon
                  >
                    <Tag className='w-3 h-3 mr-1' />
                    {tCommon(
                      post.type === 'terms_of_use'
                        ? 'content.termsOfUse'
                        : post.type === 'privacy_policy'
                          ? 'content.privacyPolicy'
                          : `content.${post.type}`
                    )}
                  </Badge>
                </div>

                {/* Post title */}
                <h1 className={cn(
                  getTypographyClasses('h1'),
                  'text-2xl lg:text-3xl leading-tight mb-4 text-gray-900 dark:text-white'
                )}>
                  {post.title}
                </h1>

                {/* Author and meta info */}
                <div className='flex flex-wrap items-center space-x-6 text-sm text-gray-600 dark:text-gray-400'>
                  <div className='flex items-center space-x-2'>
                    <User className='w-4 h-4' />
                    <span className='font-medium'>{post.author?.full_name || t('posts.unknownAuthor')}</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='w-4 h-4' />
                    <span>{formatDateDisplay(post.created_at || new Date().toISOString())}</span>
                  </div>
                  {typeof post.views === 'number' && (
                    <div className='flex items-center space-x-2'>
                      <Eye className='w-4 h-4' />
                      <span>{post.views.toLocaleString()} {t('posts.views').toLowerCase()}</span>
                    </div>
                  )}
                  {post.published_at && post.published_at !== post.created_at && (
                    <div className='flex items-center space-x-2'>
                      <Clock className='w-4 h-4' />
                      <span>Published {formatDateDisplay(post.published_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className='flex items-center space-x-2'>
                {onEdit && (
                  <Button
                    variant='ghost'
                    size='sm'
                    leftIcon={FileText}
                    onClick={onEdit}
                    className='text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                  >
                    Edit
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className='text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className='overflow-y-auto max-h-[calc(95vh-8rem)]'>
            <div className='px-8 py-6'>
              <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>

                {/* Main content area */}
                <div className='lg:col-span-3 space-y-6'>
                  {/* Featured image from images table - only show if images exist */}
                  {hasImages && (
                    <div className='mb-8'>
                      <RecordImage
                        tableName="posts"
                        recordId={post.id}
                        className="w-full h-64 lg:h-80 object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                        fallbackClassName="hidden"
                        alt={`${post.title} featured image`}
                      />
                    </div>
                  )}

                  {/* Post content */}
                  <div>
                    {post.content ? (
                      <RichTextRenderer content={post.content} />
                    ) : (
                      <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
                        <FileText className='w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600' />
                        <p>No content available for this post.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar with additional info */}
                <div className='lg:col-span-1 space-y-6'>

                  {/* Author information */}
                  {post.author && (
                    <div className='bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50'>
                      <h3 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
                        <User className='w-5 h-5 mr-2 text-blue-600 dark:text-blue-400' />
                        Author
                      </h3>
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-3'>
                          {post.author.avatar_url ? (
                            <img
                              src={post.author.avatar_url}
                              alt={post.author.full_name || 'Author avatar'}
                              className='w-12 h-12 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700'
                            />
                          ) : (
                            <div className='w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg'>
                              {(post.author.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className='font-medium text-gray-900 dark:text-white'>
                              {post.author.full_name || 'Unknown'}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              {post.author.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post statistics */}
                  <div className='bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50'>
                    <h3 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
                      <TrendingUp className='w-5 h-5 mr-2 text-purple-600 dark:text-purple-400' />
                      Post Metrics
                    </h3>
                    <div className='space-y-4'>
                      {typeof post.views === 'number' && (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 dark:text-gray-400 flex items-center'>
                            <Eye className='w-4 h-4 mr-2' />
                            Views
                          </span>
                          <span className='font-semibold text-gray-900 dark:text-white'>
                            {post.views.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600 dark:text-gray-400 flex items-center'>
                          <FileText className='w-4 h-4 mr-2' />
                          Word Count
                        </span>
                        <span className='font-semibold text-gray-900 dark:text-white'>
                          {post.content ? post.content.replace(/<[^>]*>/g, '').split(' ').length : 0}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-gray-600 dark:text-gray-400 flex items-center'>
                          <Clock className='w-4 h-4 mr-2' />
                          Read Time
                        </span>
                        <span className='font-semibold text-gray-900 dark:text-white' aria-live='polite'>
                          {typeof post.reading_time === 'number' && post.reading_time > 0
                            ? post.reading_time
                            : Math.max(1, Math.ceil((post.content ? post.content.replace(/<[^>]*>/g, '').split(' ').length : 0) / 200))
                          } min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostViewModal
