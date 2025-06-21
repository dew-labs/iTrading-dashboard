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
  AlertTriangle
} from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useAuthStore } from '../store/authStore'
import Table from '../components/Table'
import Modal from '../components/Modal'
import PostForm from '../components/PostForm'
import LoadingSpinner from '../components/LoadingSpinner'
import Select from '../components/Select'
import type { Post, PostInsert } from '../types'

// Extended Post type to include additional fields that might exist
interface ExtendedPost extends Post {
  author?: string;
  status?: 'draft' | 'published';
  views?: number;
  updated_at?: string;
}

const Posts: React.FC = () => {
  const { posts, loading, createPost, updatePost, deletePost } = usePosts()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<
    'all' | 'news' | 'event' | 'terms_of_use' | 'privacy_policy'
  >('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'title' | 'updated_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
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

  // Enhanced filtering and sorting
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const extendedPost = post as ExtendedPost
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (extendedPost.author &&
          extendedPost.author.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = filterType === 'all' || post.type === filterType
      const matchesStatus = filterStatus === 'all' || extendedPost.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })

    // Sort posts
    filtered.sort((a, b) => {
      const extendedA = a as ExtendedPost
      const extendedB = b as ExtendedPost
      let aValue: string | number
      let bValue: string | number

      switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'updated_at':
        aValue = new Date(extendedA.updated_at || a.created_at).getTime()
        bValue = new Date(extendedB.updated_at || b.created_at).getTime()
        break
      default:
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [posts, searchTerm, filterType, filterStatus, sortBy, sortOrder])

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

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'news', label: 'News' },
    { value: 'event', label: 'Events' },
    { value: 'terms_of_use', label: 'Terms of Use' },
    { value: 'privacy_policy', label: 'Privacy Policy' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' }
  ]

  const sortOptions = [
    { value: 'created_at', label: 'Created Date' },
    { value: 'updated_at', label: 'Updated Date' },
    { value: 'title', label: 'Title' }
  ]

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as keyof Post,
      render: (value: unknown, row: Post) => {
        const extendedRow = row as ExtendedPost
        const titleValue = value as string
        return (
          <div>
            <div className="font-medium text-gray-900">{titleValue}</div>
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <span>{formatTypeLabel(row.type)}</span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                  extendedRow.status || 'draft'
                )}`}
              >
                {extendedRow.status || 'draft'}
              </span>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Author',
      accessor: 'author' as keyof Post,
      render: (value: unknown, row: Post) => {
        const extendedRow = row as ExtendedPost
        return <div className="text-sm text-gray-900">{extendedRow.author || 'Unknown'}</div>
      }
    },
    {
      header: 'Views',
      accessor: 'views' as keyof Post,
      render: (value: unknown, row: Post) => {
        const extendedRow = row as ExtendedPost
        return (
          <div className="text-sm text-gray-900">{extendedRow.views?.toLocaleString() || 0}</div>
        )
      }
    },
    {
      header: 'Updated',
      accessor: 'updated_at' as keyof Post,
      render: (value: unknown, row: Post) => {
        const extendedRow = row as ExtendedPost
        const date = extendedRow.updated_at
          ? new Date(extendedRow.updated_at)
          : new Date(row.created_at)
        return <div className="text-sm text-gray-900">{date.toLocaleDateString()}</div>
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
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
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

      {/* Enhanced Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{filteredAndSortedPosts.length} posts found</span>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              options={typeOptions}
              value={filterType}
              onChange={(value) => {
                setFilterType(value as typeof filterType)
                setCurrentPage(1)
              }}
              className="w-full"
            />

            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={(value) => {
                setFilterStatus(value as typeof filterStatus)
                setCurrentPage(1)
              }}
              className="w-full"
            />

            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value as typeof sortBy)}
              className="w-full"
            />

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <Table data={paginatedPosts} columns={columns} />

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
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingPost ? 'Edit Post' : 'Create New Post'}
      >
        <PostForm post={editingPost} onSubmit={handleSubmit} onCancel={handleCloseModal} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          !deleteConfirm.isDeleting &&
          setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })
        }
        title=""
      >
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Post</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete "{deleteConfirm.post?.title}"? This action cannot be
                undone.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={confirmDelete}
            disabled={deleteConfirm.isDeleting}
          >
            {deleteConfirm.isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
            onClick={() => setDeleteConfirm({ isOpen: false, post: null, isDeleting: false })}
            disabled={deleteConfirm.isDeleting}
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* View Post Modal */}
      <Modal
        isOpen={!!viewingPost}
        onClose={() => setViewingPost(null)}
        title={viewingPost?.title || ''}
      >
        {viewingPost && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                  (viewingPost as ExtendedPost).status || 'draft'
                )}`}
              >
                {(viewingPost as ExtendedPost).status || 'draft'}
              </span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {formatTypeLabel(viewingPost.type)}
              </span>
              <span className="text-sm text-gray-500">
                {(viewingPost as ExtendedPost).views || 0} views
              </span>
            </div>

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-900">
                {viewingPost.content || 'No content available.'}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
              <p>Created: {new Date(viewingPost.created_at).toLocaleDateString()}</p>
              {(viewingPost as ExtendedPost).author && (
                <p>Author: {(viewingPost as ExtendedPost).author}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Posts
