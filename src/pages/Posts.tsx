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
import { usePosts, type PostWithAuthor } from '../hooks/usePosts'
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
import PostViewModal from '../components/PostViewModal'
import { POST_STATUSES, POST_TYPES } from '../constants/general'
import type { PostInsert } from '../types'

// Theme imports
import {
  getPageLayoutClasses,
  getStatsCardProps,
  getIconClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'
import Button from '../components/Button'
import Input from '../components/Input'
import { formatDateDisplay } from '../utils/format'
import { FILTER_OPTIONS } from '../constants/components'

// Use PostWithAuthor which includes all the fields we need
type ExtendedPost = PostWithAuthor

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
  const [sortColumn, setSortColumn] = useState<keyof PostWithAuthor | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [pageInputValue, setPageInputValue] = useState('1')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    post: PostWithAuthor | null
    isDeleting: boolean
  }>({
    isOpen: false,
    post: null,
    isDeleting: false
  })
  const [viewingPost, setViewingPost] = useState<PostWithAuthor | null>(null)

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
        (extendedPost.author?.full_name &&
          extendedPost.author.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

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
        aValue = new Date(a.created_at || 0).getTime()
        bValue = new Date(b.created_at || 0).getTime()
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

  const handleView = (post: PostWithAuthor) => {
    setViewingPost(post)
  }

  const handleEdit = (post: PostWithAuthor) => {
    // Security check - only allow editing if user is authenticated
    if (!user) {
      alert(t('posts.loginRequired', { action: tCommon('actions.edit').toLowerCase() }))
      return
    }
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleDelete = (post: PostWithAuthor) => {
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
    setPageInputValue(page.toString())
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setCurrentPage(1) // Reset to first page when changing tabs
  }

  // Use predefined filter options from constants
  const statusOptions = [...FILTER_OPTIONS.postStatus]

  const handleSort = (column: keyof PostWithAuthor) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column as keyof PostWithAuthor)
      setSortDirection('desc')
    }
  }

  const columns = [
    {
      header: t('posts.postDetails'),
      accessor: 'title' as keyof PostWithAuthor,
      sortable: true,
      render: (value: unknown, row: PostWithAuthor) => {
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
      accessor: 'id' as keyof PostWithAuthor,
      render: (value: unknown, row: PostWithAuthor) => {
        return (
          <Badge variant={row.status as 'published' | 'draft'} size='sm' showIcon>
            {tCommon(`status.${row.status}`)}
          </Badge>
        )
      }
    },
    {
      header: t('posts.authorAndDates'),
      accessor: 'created_at' as keyof PostWithAuthor,
      sortable: true,
      render: (value: unknown, row: PostWithAuthor) => {
        const extendedRow = row as ExtendedPost
        return (
          <div className={getTypographyClasses('small')}>
            <div className='flex items-center text-gray-900 dark:text-gray-100 mb-1'>
              <User className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
              <span>{extendedRow.author?.full_name || t('posts.unknownAuthor')}</span>
            </div>
            <div className='flex items-center text-gray-500 dark:text-gray-400'>
              <Clock className='w-4 h-4 mr-1' />
              <span>{formatDateDisplay(value as string)}</span>
            </div>

          </div>
        )
      }
    },
    {
      header: t('posts.engagement'),
      accessor: 'id' as keyof PostWithAuthor,
      render: (value: unknown, row: PostWithAuthor) => {
        const extendedRow = row as ExtendedPost
        return (
          <div className={cn(getTypographyClasses('small'), 'text-gray-900 dark:text-gray-100')}>
            <div className='flex items-center space-x-4'>
              <div className='text-center'>
                <div className='font-medium'>{extendedRow.views?.toLocaleString() || 0}</div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>{t('posts.views')}</div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: t('posts.actions'),
      accessor: 'id' as keyof PostWithAuthor,
      render: (value: unknown, row: PostWithAuthor) => (
        <div className='flex space-x-1'>
          <button
            onClick={() => handleView(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
            title={t('posts.tooltips.viewPost')}
          >
            <Eye className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors'
            title={t('posts.tooltips.editPost')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
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
            <Button
              variant='primary'
              size='md'
              leftIcon={Plus}
              onClick={() => {
                if (!user) {
                  alert(t('posts.loginRequired', { action: tCommon('actions.create').toLowerCase() }))
                  return
                }
                setIsModalOpen(true)
              }}
            >
              {t('posts.createPost')}
            </Button>
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
                <Input
                  type='text'
                  placeholder={tCommon('placeholders.searchPostsPlaceholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  leftIcon={Search}
                  variant='search'
                />
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
              </div>
            </div>

            {/* Table */}
            <Table<PostWithAuthor>
              data={paginatedPosts}
              columns={columns}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-3'>
              <div className='flex items-center space-x-6'>
                <PaginationSelector
                  value={itemsPerPage}
                  onChange={value => {
                    setItemsPerPage(value)
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                />
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {tCommon('pagination.showingRows', {
                      startItem: (currentPage - 1) * itemsPerPage + 1,
                      endItem: Math.min(currentPage * itemsPerPage, filteredAndSortedPosts.length),
                      total: filteredAndSortedPosts.length
                    })}
                  </span>
                </div>
              </div>

              {totalPages > 1 && (
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 19l-7-7 7-7'
                      />
                    </svg>
                  </button>
                  <div className='flex items-center'>
                    <span className='text-sm text-gray-700 dark:text-gray-300'>{tCommon('pagination.page')}</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <input
                      type='text'
                      value={pageInputValue}
                      onChange={e => {
                        setPageInputValue(e.target.value)
                      }}
                      onBlur={e => {
                        const page = parseInt(e.target.value)
                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                          handlePageChange(page)
                        } else {
                          setPageInputValue(currentPage.toString())
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const page = parseInt(pageInputValue)
                          if (!isNaN(page) && page >= 1 && page <= totalPages) {
                            handlePageChange(page)
                          } else {
                            setPageInputValue(currentPage.toString())
                          }
                        }
                      }}
                      className='w-12 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      {tCommon('pagination.of')} {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className='p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </TabNavigation>

        {/* Modals */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingPost ? t('posts.editPost') : t('posts.createNewPost')}
          size='xl'
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

        {/* Enhanced Post Viewer Modal */}
        {viewingPost && (
          <PostViewModal
            isOpen={true}
            onClose={() => setViewingPost(null)}
            post={viewingPost}
            onEdit={() => {
              handleEdit(viewingPost)
              setViewingPost(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Posts
