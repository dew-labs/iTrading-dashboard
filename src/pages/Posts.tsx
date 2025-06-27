import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Clock,
  User,
  Tag,
  FileText,
  Bookmark,
  TrendingUp
} from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useAuthStore } from '../store/authStore'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import Table from '../components/Table'
import Modal from '../components/Modal'
import PostForm from '../components/PostForm'
import ConfirmDialog from '../components/ConfirmDialog'
import PageLoadingSpinner from '../components/PageLoadingSpinner'
import TabNavigation from '../components/TabNavigation'
import FilterDropdown from '../components/FilterDropdown'
import PaginationSelector from '../components/PaginationSelector'
import RecordImage from '../components/RecordImage'
import Badge from '../components/Badge'
import RichTextRenderer from '../components/RichTextRenderer'
import { POST_STATUSES, POST_TYPES } from '../constants/general'
import type { Post, PostInsert } from '../types'

// Theme imports
import {
  getPageLayoutClasses,
  getButtonClasses,
  getStatsCardProps,
  getIconClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'
import { formatDateDisplay } from '../utils/format'
import { INPUT_VARIANTS, FILTER_OPTIONS } from '../constants/components'

// Extended Post type to include additional fields that might exist
interface ExtendedPost extends Post {
  author?: string
  views?: number
  updated_at?: string
}

// Tab configuration keys
const POST_TAB_CONFIGS = [
  {
    id: 'all',
    labelKey: 'posts.tabs.all.label',
    descriptionKey: 'posts.tabs.all.description'
  },
  {
    id: POST_TYPES.NEWS,
    labelKey: 'posts.tabs.news.label',
    descriptionKey: 'posts.tabs.news.description'
  },
  {
    id: POST_TYPES.EVENT,
    labelKey: 'posts.tabs.event.label',
    descriptionKey: 'posts.tabs.event.description'
  },
  {
    id: POST_TYPES.TERMS_OF_USE,
    labelKey: 'posts.tabs.termsOfUse.label',
    descriptionKey: 'posts.tabs.termsOfUse.description'
  },
  {
    id: POST_TYPES.PRIVACY_POLICY,
    labelKey: 'posts.tabs.privacyPolicy.label',
    descriptionKey: 'posts.tabs.privacyPolicy.description'
  }
]

const Posts: React.FC = () => {
  const { posts, loading, createPost, updatePost, deletePost } = usePosts()
  const { user } = useAuthStore()
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [sortColumn, setSortColumn] = useState<keyof Post | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    post: Post | null
    isDeleting: boolean
  }>({
    isOpen: false,
    post: null,
    isDeleting: false
  })
  const [viewingPost, setViewingPost] = useState<Post | null>(null)

  // Theme classes
  const layout = getPageLayoutClasses()

  // Calculate tab counts with translations
  const tabsWithCounts = useMemo(() => {
    return POST_TAB_CONFIGS.map(tab => ({
      id: tab.id,
      label: t(tab.labelKey),
      description: t(tab.descriptionKey),
      count: tab.id === 'all' ? posts.length : posts.filter(post => post.type === tab.id).length
    }))
  }, [posts, t])

  // Enhanced filtering and sorting
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter(post => {
      const extendedPost = post as ExtendedPost
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (extendedPost.author &&
          extendedPost.author.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = activeTab === 'all' || post.type === activeTab
      const matchesStatus = filterStatus === 'all' || post.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })

    // Sort posts
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortColumn) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'created_at':
      default:
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [posts, searchTerm, activeTab, filterStatus, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPosts.length / itemsPerPage)
  const paginatedPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleView = (post: Post) => {
    setViewingPost(post)
  }

  const handleEdit = (post: Post) => {
    // Security check - only allow editing if user is authenticated
    if (!user) {
      alert(t('posts.loginRequired', { action: tCommon('actions.edit').toLowerCase() }))
      return
    }
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleDelete = (post: Post) => {
    // Security check - only allow deleting if user is authenticated
    if (!user) {
      alert(t('posts.loginRequired', { action: tCommon('actions.delete').toLowerCase() }))
      return
    }
    setDeleteConfirm({ isOpen: true, post, isDeleting: false })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.post) return

    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }))

    try {
      await deletePost(deleteConfirm.post.id)
      setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })
      // Reset to first page if current page becomes empty
      if (paginatedPosts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPost(null)
  }

  const handleSubmit = async (data: PostInsert) => {
    try {
      if (editingPost) {
        await updatePost(editingPost.id, data)
      } else {
        await createPost(data)
        // Go to first page to see the new post
        setCurrentPage(1)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save post:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setCurrentPage(1) // Reset to first page when changing tabs
  }

  // Use predefined filter options from constants
  const statusOptions = [...FILTER_OPTIONS.postStatus]

  const handleSort = (column: keyof Post) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const columns = [
    {
      header: t('posts.postDetails'),
      accessor: 'title' as keyof Post,
      sortable: true,
      render: (value: unknown, row: Post) => {
        return (
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              <RecordImage
                tableName='posts'
                recordId={row.id.toString()}
                className='w-12 h-12 rounded-lg object-cover border border-gray-200'
                fallbackClassName='w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center'
                alt={`${value as string} post image`}
                fallbackIcon={<Tag className='w-4 h-4 text-white' />}
              />
            </div>
            <div className='flex-1 min-w-0'>
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>{value as string}</div>
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
      }
    },
    {
      header: t('posts.status'),
      accessor: 'id' as keyof Post,
      render: (value: unknown, row: Post) => {
        return (
          <Badge variant={row.status as 'published' | 'draft'} size='sm' showIcon>
            {tCommon(`status.${row.status}`)}
          </Badge>
        )
      }
    },
    {
      header: t('posts.authorAndDates'),
      accessor: 'created_at' as keyof Post,
      sortable: true,
      render: (value: unknown, row: Post) => {
        const extendedRow = row as ExtendedPost
        return (
          <div className={getTypographyClasses('small')}>
            <div className='flex items-center text-gray-900 mb-1'>
              <User className='w-4 h-4 mr-1 text-gray-400' />
              <span>{extendedRow.author || t('posts.unknownAuthor')}</span>
            </div>
            <div className='flex items-center text-gray-500'>
              <Clock className='w-4 h-4 mr-1' />
              <span>{formatDateDisplay(value as string)}</span>
            </div>
            {extendedRow.updated_at && (
              <div className='text-xs text-gray-400 mt-1'>
                {t('posts.updated')} {formatDateDisplay(extendedRow.updated_at)}
              </div>
            )}
          </div>
        )
      }
    },
    {
      header: t('posts.engagement'),
      accessor: 'id' as keyof Post,
      render: (value: unknown, row: Post) => {
        const extendedRow = row as ExtendedPost
        return (
          <div className={cn(getTypographyClasses('small'), 'text-gray-900')}>
            <div className='flex items-center space-x-4'>
              <div className='text-center'>
                <div className='font-medium'>{extendedRow.views?.toLocaleString() || 0}</div>
                <div className='text-xs text-gray-500'>{t('posts.views')}</div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: t('posts.actions'),
      accessor: 'id' as keyof Post,
      render: (value: unknown, row: Post) => (
        <div className='flex space-x-1'>
          <button
            onClick={() => handleView(row)}
            className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors'
            title={t('posts.tooltips.viewPost')}
          >
            <Eye className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className='p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors'
            title={t('posts.tooltips.editPost')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
            title={t('posts.tooltips.deletePost')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  // Stats calculations
  const publishedPosts = posts.filter(p => p.status === POST_STATUSES.PUBLISHED).length
  const draftPosts = posts.filter(p => p.status === POST_STATUSES.DRAFT).length
  const totalViews = posts.reduce((sum, p) => sum + ((p as ExtendedPost).views || 0), 0)

  const totalPostsProps = getStatsCardProps('posts')
  const publishedProps = getStatsCardProps('posts')
  const draftsProps = getStatsCardProps('posts')
  const viewsProps = getStatsCardProps('posts')

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('posts.loadingPosts')} />
      </div>
    )
  }

  return (
    <div className={layout.container}>
      <div className='space-y-6'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('posts.title')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('posts.description')}
            </p>
          </div>
          <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
            <button
              onClick={() => {
                if (!user) {
                  alert(t('posts.loginRequired', { action: tCommon('actions.create').toLowerCase() }))
                  return
                }
                setIsModalOpen(true)
              }}
              className={getButtonClasses('primary', 'md')}
            >
              <Plus className='w-4 h-4 mr-2' />
              {t('posts.createPost')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={layout.grid}>
          <div className={totalPostsProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'posts')}>
                <FileText className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={totalPostsProps.valueClasses}>{posts.length}</div>
                <div className={totalPostsProps.labelClasses}>{t('posts.totalPosts')}</div>
              </div>
            </div>
          </div>

          <div className={publishedProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'posts')}>
                <Bookmark className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={publishedProps.valueClasses}>{publishedPosts}</div>
                <div className={publishedProps.labelClasses}>{t('posts.published')}</div>
              </div>
            </div>
          </div>

          <div className={draftsProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'banners')}>
                <Edit2 className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={draftsProps.valueClasses}>{draftPosts}</div>
                <div className={draftsProps.labelClasses}>{t('posts.drafts')}</div>
              </div>
            </div>
          </div>

          <div className={viewsProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'users')}>
                <TrendingUp className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={viewsProps.valueClasses}>{totalViews.toLocaleString()}</div>
                <div className={viewsProps.labelClasses}>{t('posts.totalViews')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs with Content Inside */}
        <TabNavigation tabs={tabsWithCounts} activeTab={activeTab} onTabChange={handleTabChange}>
          {/* Enhanced Filters */}
          <div className='p-6 space-y-4'>
            {/* Search and filters row */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4'>
              <div className='flex-1 max-w-md'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder={tCommon('placeholders.searchPostsPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={cn(INPUT_VARIANTS.withIcon, 'py-2')}
                  />
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <FilterDropdown
                  options={statusOptions}
                  value={filterStatus}
                  onChange={value => {
                    setFilterStatus(value as 'all' | 'draft' | 'published')
                    setCurrentPage(1)
                  }}
                  label={tCommon('general.status')}
                />
                <PaginationSelector
                  value={itemsPerPage}
                  onChange={value => {
                    setItemsPerPage(value)
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                  totalItems={filteredAndSortedPosts.length}
                />
              </div>
            </div>
          </div>

          {/* Table with padding */}
          <div className='px-6 pb-6'>
            <Table
              data={paginatedPosts}
              columns={columns}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl'>
              <div className='flex-1 flex justify-between sm:hidden'>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={getButtonClasses('secondary', 'md')}
                >
                  {tCommon('actions.previous')}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(getButtonClasses('secondary', 'md'), 'ml-3')}
                >
                  {tCommon('actions.next')}
                </button>
              </div>

              <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                <div></div>

                <div>
                  <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      ←
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-gray-900 border-gray-900 text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </TabNavigation>

        {/* Modals */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingPost ? t('posts.editPost') : t('posts.createNewPost')}
        >
          <PostForm post={editingPost} onSubmit={handleSubmit} onCancel={handleCloseModal} />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })}
          onConfirm={confirmDelete}
          title={t('posts.deletePostTitle')}
          message={t('posts.deleteConfirmText', {
            title: deleteConfirm.post?.title || t('posts.thisPost')
          })}
          confirmLabel={tCommon('actions.delete')}
          cancelLabel={tCommon('actions.cancel')}
          isDestructive={true}
          isLoading={deleteConfirm.isDeleting}
          variant='danger'
        />

        {/* Post Viewer Modal */}
        {viewingPost && (
          <Modal
            isOpen={true}
            onClose={() => setViewingPost(null)}
            title={`${t('posts.viewPost')}: ${viewingPost.title}`}
          >
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Badge variant={viewingPost.status as 'published' | 'draft'} size='sm' showIcon>
                  {tCommon(`status.${viewingPost.status}`)}
                </Badge>
                <Badge
                  variant={viewingPost.type as 'news' | 'event' | 'terms_of_use' | 'privacy_policy'}
                  size='sm'
                  showIcon
                >
                  {tCommon(
                    viewingPost.type === 'terms_of_use'
                      ? 'content.termsOfUse'
                      : viewingPost.type === 'privacy_policy'
                        ? 'content.privacyPolicy'
                        : `content.${viewingPost.type}`
                  )}
                </Badge>
              </div>

              <div className='space-y-4'>
                <div className={getTypographyClasses('h2')}>{viewingPost.title}</div>
                {viewingPost.content && (
                  <div className='mt-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Content</label>
                    <RichTextRenderer content={viewingPost.content} />
                  </div>
                )}
              </div>

              <div className='pt-4 border-t'>
                <div
                  className={cn('flex items-center justify-between', getTypographyClasses('small'))}
                >
                  <span>
                    {t('posts.created')} {formatDateDisplay(viewingPost.created_at)}
                  </span>
                  {(viewingPost as ExtendedPost).views && (
                    <span>
                      {t('posts.views')}: {(viewingPost as ExtendedPost).views?.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  onClick={() => setViewingPost(null)}
                  className={getButtonClasses('secondary', 'md')}
                >
                  {tCommon('actions.close')}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

export default Posts
