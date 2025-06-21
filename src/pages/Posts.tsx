import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  User,
  Tag
} from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useAuthStore } from '../store/authStore'
import Table from '../components/Table'
import Modal from '../components/Modal'
import PostForm from '../components/PostForm'
import LoadingSpinner from '../components/LoadingSpinner'
import TabNavigation from '../components/TabNavigation'
import FilterDropdown from '../components/FilterDropdown'
import type { Post, PostInsert } from '../types'

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
  const [itemsPerPage] = useState(10)
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

  const formatTypeLabel = (type: string) => {
    switch (type) {
    case 'terms_of_use':
      return 'Terms of Use'
    case 'privacy_policy':
      return 'Privacy Policy'
    default:
      return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800'
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
    case 'news':
      return 'bg-blue-100 text-blue-800'
    case 'event':
      return 'bg-purple-100 text-purple-800'
    case 'terms_of_use':
      return 'bg-red-100 text-red-800'
    case 'privacy_policy':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' }
  ]

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
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{value as string}</div>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(
                    row.type
                  )}`}
                >
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
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(row.status)}`}
          >
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
          <div className="text-sm">
            <div className="flex items-center text-gray-900 mb-1">
              <User className="w-4 h-4 mr-1 text-gray-400" />
              <span>{extendedRow.author || 'Unknown Author'}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{new Date(value as string).toLocaleDateString()}</span>
            </div>
            {extendedRow.updated_at && (
              <div className="text-xs text-gray-400 mt-1">
                Updated: {new Date(extendedRow.updated_at).toLocaleDateString()}
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
          <div className="text-sm text-gray-900">
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
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit post"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" className="text-gray-900" />
      </div>
    )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedPosts.length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts Management</h1>
          <p className="mt-1 text-gray-600">Create, edit, and manage your content posts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (!user) {
                alert('You must be logged in to create posts')
                return
              }
              setIsModalOpen(true)
            }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </button>
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
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FilterDropdown
                options={statusOptions}
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value as typeof filterStatus)
                  setCurrentPage(1)
                }}
                placeholder="Filter by Status"
              />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
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
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
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
                    <ChevronLeft className="h-5 w-5" />
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
                    <ChevronRight className="h-5 w-5" />
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
        <PostForm post={editingPost} onSubmit={handleSubmit} onCancel={handleCloseModal} />
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <Modal
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })}
          title="Delete Post"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. This will permanently delete the post "
                  {deleteConfirm.post?.title}".
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })}
                disabled={deleteConfirm.isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteConfirm.isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteConfirm.isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Post Modal */}
      {viewingPost && (
        <Modal
          isOpen={!!viewingPost}
          onClose={() => setViewingPost(null)}
          title={`View Post: ${viewingPost.title}`}
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{viewingPost.title}</h3>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(
                    viewingPost.type
                  )}`}
                >
                  {formatTypeLabel(viewingPost.type)}
                </span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                    viewingPost.status
                  )}`}
                >
                  {viewingPost.status.charAt(0).toUpperCase() + viewingPost.status.slice(1)}
                </span>
              </div>
            </div>
            {viewingPost.content && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Content</h4>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {viewingPost.content}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setViewingPost(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Posts
