import React from 'react'
import { Edit2, Trash2, Eye, Clock, User, Tag, EyeOff } from 'lucide-react'
import Table from '../../../components/molecules/Table'
import { Badge } from '../../../components/atoms'
import RecordImage from '../../../components/features/images/RecordImage'
import { useTranslation, usePageTranslation } from '../../../hooks/useTranslation'
import { formatDateDisplay } from '../../../utils/format'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import type { PostWithAuthor } from '../../../hooks/usePosts'

interface PostsTableProps {
  posts: PostWithAuthor[]
  imagesByRecord?: Record<string, import('../../../types').Image[]>
  onView: (post: PostWithAuthor) => void
  onEdit: (post: PostWithAuthor) => void
  onDelete: (post: PostWithAuthor) => void
  onToggleVisible?: (post: PostWithAuthor) => Promise<void>
  sortColumn: keyof PostWithAuthor | null
  sortDirection: 'asc' | 'desc'
  onSort: (column: keyof PostWithAuthor) => void
}

const PostsTable: React.FC<PostsTableProps> = ({
  posts,
  imagesByRecord = {},
  onView,
  onEdit,
  onDelete,
  onToggleVisible,
  sortColumn,
  sortDirection,
  onSort
}) => {
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation()

  const handleToggleVisible = async (post: PostWithAuthor) => {
    if (typeof onToggleVisible === 'function') {
      await onToggleVisible(post)
    }
  }

  const columns = [
    {
      header: t('posts.postDetails'),
      accessor: 'title' as keyof PostWithAuthor,
      sortable: true,
      render: (value: unknown, row: PostWithAuthor) => (
        <div className='flex items-center space-x-3'>
          <div className='flex-shrink-0'>
            <RecordImage
              image={imagesByRecord[row.id]?.[0]}
              className='w-12 h-12 rounded-lg object-cover border border-gray-200'
              fallbackClassName='w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center'
              alt={`${value as string} post image`}
              fallbackIcon={<Tag className='w-4 h-4 text-white' />}
            />
          </div>
          <div className='flex-1 min-w-0'>
            <div className={cn(getTypographyClasses('h4'), 'truncate')}>
              {value as string}
            </div>
            <div className='flex items-center space-x-2 mt-1'>
              <Badge
                variant={row.type as 'news' | 'event' | 'terms_of_use' | 'privacy_policy'}
                size='sm'
                showIcon
              >
                {tCommon(
                  row.type === 'terms_of_use'
                    ? 'content.termsOfUse'
                    : row.type === 'privacy_policy'
                      ? 'content.privacyPolicy'
                      : `content.${row.type}`
                )}
              </Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      header: t('posts.status'),
      accessor: 'id' as keyof PostWithAuthor,
      render: (value: unknown, row: PostWithAuthor) => (
        <Badge variant={row.status as 'published' | 'draft'} size='sm' showIcon>
          {tCommon(`status.${row.status}`)}
        </Badge>
      )
    },
    {
      header: t('posts.authorAndDates'),
      accessor: 'created_at' as keyof PostWithAuthor,
      sortable: true,
      render: (value: unknown, row: PostWithAuthor) => (
        <div className={getTypographyClasses('small')}>
          <div className='flex items-center text-gray-900 dark:text-gray-100 mb-1'>
            <User className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
            <span>{row.author?.full_name || t('posts.unknownAuthor')}</span>
          </div>
          <div className='flex items-center text-gray-500 dark:text-gray-400'>
            <Clock className='w-4 h-4 mr-1' />
            <span>{formatDateDisplay(value as string)}</span>
          </div>
        </div>
      )
    },
    {
      header: t('posts.engagement'),
      accessor: 'id' as keyof PostWithAuthor,
      render: (value: unknown, row: PostWithAuthor) => (
        <div className={cn(getTypographyClasses('small'), 'text-gray-900 dark:text-gray-100')}>
          <div className='flex items-center space-x-4'>
            <div className='text-center'>
              <div className='font-medium'>{row.views?.toLocaleString() || 0}</div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                {t('posts.views')}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      header: t('posts.actions'),
      accessor: 'id' as keyof PostWithAuthor,
      render: (value: unknown, row: PostWithAuthor) => (
        <div className='flex space-x-1'>
          <button
            onClick={e => { e.stopPropagation(); handleToggleVisible(row) }}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
            title={row.is_visible ? t('banners.tooltips.deactivateBanner') : t('banners.tooltips.activateBanner')}
          >
            {row.is_visible ? (
              <Eye className={getIconClasses('action')} />
            ) : (
              <EyeOff className={getIconClasses('action')} />
            )}
          </button>
          <button
            onClick={() => onEdit(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors'
            title={t('posts.tooltips.editPost')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
            title={t('posts.tooltips.deletePost')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  return (
    <Table<PostWithAuthor>
      data={posts}
      columns={columns}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onView}
    />
  )
}

export default PostsTable
