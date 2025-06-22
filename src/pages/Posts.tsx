import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  AlertTriangle,
  Clock,
  User,
  Tag,
  FileText,
  Bookmark,
  TrendingUp
} from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useAuthStore } from '../store/authStore'
import Table from '../components/Table'
import Modal from '../components/Modal'
import PostForm from '../components/PostForm'
import LoadingSpinner from '../components/LoadingSpinner'
import TabNavigation from '../components/TabNavigation'
import FilterDropdown from '../components/FilterDropdown'
import PaginationSelector from '../components/PaginationSelector'
import type { Post, PostInsert } from '../types'

// Theme imports
import {
  getPageLayoutClasses,
  getButtonClasses,
  getStatsCardProps,
  getStatusBadge,
  getTypeBadge,
  getIconClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'
import { formatDateDisplay, formatTypeLabel } from '../utils/format'
import { INPUT_VARIANTS, FILTER_OPTIONS } from '../constants/components'

// Extended Post type to include additional fields that might exist
interface ExtendedPost extends Post {
  author?: string;
  views?: number;
  updated_at?: string;
}

// Tab configuration
const POST_TABS = [
  {
    id: 'all',
    label: 'All Posts',
    count: 0,
    description: 'All content posts'
  },
  {
    id: 'news',
    label: 'News',
    count: 0,
    description: 'News articles and updates'
  },
  {
    id: 'event',
    label: 'Events',
    count: 0,
    description: 'Event announcements and information'
  },
  {
    id: 'terms_of_use',
    label: 'Terms of Use',
    count: 0,
    description: 'Legal and policy documents'
  },
  {
    id: 'privacy_policy',
    label: 'Privacy Policy',
    count: 0,
    description: 'Privacy and data protection policies'
  }
]

const Posts: React.FC = () => {
  const { posts, loading, createPost, updatePost, deletePost } = usePosts()
  const { user } = useAuthStore()
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
    isOpen: boolean;
    post: Post | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    post: null,
    isDeleting: false
  })
  const [viewingPost, setViewingPost] = useState<Post | null>(null)

  // Theme classes
  const layout = getPageLayoutClasses()

  // Calculate tab counts
  const tabsWithCounts = useMemo(() => {
    return POST_TABS.map((tab) => ({
      ...tab,
      count: tab.id === 'all' ? posts.length : posts.filter((post) => post.type === tab.id).length
    }))
  }, [posts])

  // Enhanced filtering and sorting
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
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
      alert('You must be logged in to edit posts')
      return
    }
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleDelete = (post: Post) => {
    // Security check - only allow deleting if user is authenticated
    if (!user) {
      alert('You must be logged in to delete posts')
      return
    }
    setDeleteConfirm({ isOpen: true, post, isDeleting: false })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.post) return

    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }))

    try {
      await deletePost(deleteConfirm.post.id)
      setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })
      // Reset to first page if current page becomes empty
      if (paginatedPosts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }))
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
      header: 'Post Details',
      accessor: 'title' as keyof Post,
      sortable: true,
      render: (value: unknown, row: Post) => {
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={getIconClasses('table')}>
                <Tag className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>{value as string}</div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={getTypeBadge(row.type)}>
                  {formatTypeLabel(row.type)}
                </span>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Status',
      accessor: 'id' as keyof Post,
      render: (value: unknown, row: Post) => {
        return (
          <span className={getStatusBadge(row.status)}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        )
      }
    },
    {
      header: 'Author & Dates',
      accessor: 'created_at' as keyof Post,
      sortable: true,
      render: (value: unknown, row: Post) => {
        const extendedRow = row as ExtendedPost
        return (
          <div className={getTypographyClasses('small')}>
            <div className="flex items-center text-gray-900 mb-1">
              <User className="w-4 h-4 mr-1 text-gray-400" />
              <span>{extendedRow.author || 'Unknown Author'}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatDateDisplay(value as string)}</span>
            </div>
            {extendedRow.updated_at && (
              <div className="text-xs text-gray-400 mt-1">
                Updated: {formatDateDisplay(extendedRow.updated_at)}
              </div>
            )}
          </div>
        )
      }
    },
    {
      header: 'Engagement',
      accessor: 'id' as keyof Post,
      render: (value: unknown, row: Post) => {
        const extendedRow = row as ExtendedPost
        return (
          <div className={cn(getTypographyClasses('small'), 'text-gray-900')}>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="font-medium">{extendedRow.views?.toLocaleString() || 0}</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Post,
      render: (value: unknown, row: Post) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleView(row)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View post"
          >
            <Eye className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit post"
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete post"
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  // Stats calculations
  const publishedPosts = posts.filter((p) => p.status === 'published').length
  const draftPosts = posts.filter((p) => p.status === 'draft').length
  const totalViews = posts.reduce((sum, p) => sum + ((p as ExtendedPost).views || 0), 0)

  const totalPostsProps = getStatsCardProps('posts')
  const publishedProps = getStatsCardProps('posts')
  const draftsProps = getStatsCardProps('posts')
  const viewsProps = getStatsCardProps('posts')

  if (loading) {
    return (
      <div className={layout.container}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" className="text-gray-900" />
        </div>
      </div>
    )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedPosts.length)

  return (
    <div className={layout.container}>
      <div className="space-y-6">
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>Posts Management</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              Create, edit, and manage your content posts
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => {
                if (!user) {
                  alert('You must be logged in to create posts')
                  return
                }
                setIsModalOpen(true)
              }}
              className={getButtonClasses('primary', 'md')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={layout.grid}>
          <div className={totalPostsProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'posts')}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={totalPostsProps.valueClasses}>{posts.length}</div>
                <div className={totalPostsProps.labelClasses}>Total Posts</div>
              </div>
            </div>
          </div>

          <div className={publishedProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'posts')}>
                <Bookmark className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={publishedProps.valueClasses}>{publishedPosts}</div>
                <div className={publishedProps.labelClasses}>Published</div>
              </div>
            </div>
          </div>

          <div className={draftsProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'banners')}>
                <Edit2 className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={draftsProps.valueClasses}>{draftPosts}</div>
                <div className={draftsProps.labelClasses}>Drafts</div>
              </div>
            </div>
          </div>

          <div className={viewsProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'users')}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={viewsProps.valueClasses}>{totalViews.toLocaleString()}</div>
                <div className={viewsProps.labelClasses}>Total Views</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs with Content Inside */}
        <TabNavigation tabs={tabsWithCounts} activeTab={activeTab} onTabChange={handleTabChange}>
          {/* Enhanced Filters */}
          <div className="p-6 space-y-4">
            {/* Search and filters row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts by title, content, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(INPUT_VARIANTS.withIcon, 'py-2')}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FilterDropdown
                  options={statusOptions}
                  value={filterStatus}
                  onChange={(value) => {
                    setFilterStatus(value as 'all' | 'draft' | 'published')
                    setCurrentPage(1)
                  }}
                  label="Status"
                />
                <PaginationSelector
                  value={itemsPerPage}
                  onChange={(value) => {
                    setItemsPerPage(value)
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                  totalItems={filteredAndSortedPosts.length}
                />
                <div className={cn('flex items-center space-x-2', getTypographyClasses('small'))}>
                  <Calendar className="w-4 h-4" />
                  <span>
                    Showing {startItem}-{endItem} of {filteredAndSortedPosts.length} posts
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table with padding */}
          <div className="px-6 pb-6">
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
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={getButtonClasses('secondary', 'md')}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(getButtonClasses('secondary', 'md'), 'ml-3')}
                >
                  Next
                </button>
              </div>

              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className={getTypographyClasses('small')}>
                    Showing <span className="font-medium">{startItem}</span> to{' '}
                    <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{filteredAndSortedPosts.length}</span> results
                  </p>
                </div>

                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
          title={editingPost ? 'Edit Post' : 'Create New Post'}
        >
          <PostForm
            post={editingPost}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        {deleteConfirm.isOpen && (
          <Modal
            isOpen={deleteConfirm.isOpen}
            onClose={() => setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })}
            title="Confirm Delete"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className={getTypographyClasses('h4')}>Delete Post</h3>
                  <p className={getTypographyClasses('small')}>
                    Are you sure you want to delete "{deleteConfirm.post?.title}"? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })}
                  disabled={deleteConfirm.isDeleting}
                  className={getButtonClasses('secondary', 'md')}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteConfirm.isDeleting}
                  className={getButtonClasses('danger', 'md')}
                >
                  {deleteConfirm.isDeleting ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Post Viewer Modal */}
        {viewingPost && (
          <Modal
            isOpen={true}
            onClose={() => setViewingPost(null)}
            title={`View Post: ${viewingPost.title}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={getStatusBadge(viewingPost.status)}>
                  {viewingPost.status.charAt(0).toUpperCase() + viewingPost.status.slice(1)}
                </span>
                <span className={getTypeBadge(viewingPost.type)}>
                  {formatTypeLabel(viewingPost.type)}
                </span>
              </div>

              <div className="prose max-w-none">
                <div className={getTypographyClasses('h2')}>{viewingPost.title}</div>
                {viewingPost.content && (
                  <div className={cn(getTypographyClasses('base'), 'mt-4')}>
                    {viewingPost.content}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className={cn('flex items-center justify-between', getTypographyClasses('small'))}>
                  <span>Created: {formatDateDisplay(viewingPost.created_at)}</span>
                  {(viewingPost as ExtendedPost).views && (
                    <span>Views: {(viewingPost as ExtendedPost).views?.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setViewingPost(null)}
                  className={getButtonClasses('secondary', 'md')}
                >
                  Close
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
