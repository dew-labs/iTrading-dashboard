import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, Calendar } from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import Table from '../components/Table'
import Modal from '../components/Modal'
import PostForm from '../components/PostForm'
import LoadingSpinner from '../components/LoadingSpinner'
import Select from '../components/Select'
import { Post, PostInsert } from '../types/database'

const Posts: React.FC = () => {
  const { posts, loading, createPost, updatePost, deletePost } = usePosts()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'news' | 'event'>('all')
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'published' | 'draft' | 'archived'
  >('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || post.type === filterType
    const matchesStatus =
      filterStatus === 'all' || post.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleEdit = (post: Post) => {
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPost(null)
  }

  const handleSubmit = async (data: PostInsert) => {
    if (editingPost) {
      await updatePost(editingPost.id, data)
    } else {
      await createPost(data)
    }
    handleCloseModal()
  }

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'news', label: 'News' },
    { value: 'event', label: 'Events' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ]

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as keyof Post,
      render: (value: string, row: Post) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 capitalize">{row.type}</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Post,
      render: (value: string) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value === 'published'
              ? 'bg-green-100 text-green-800'
              : value === 'draft'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      )
    },
    {
      header: 'Author',
      accessor: 'author' as keyof Post
    },
    {
      header: 'Date',
      accessor: 'created_at' as keyof Post,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Views',
      accessor: 'views' as keyof Post,
      render: (value: number) => value.toLocaleString()
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Post,
      render: (value: number, row: Post) => (
        <div className="flex space-x-2">
          <button
            onClick={() => console.log('View post:', value)}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(value)}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="mt-1 text-gray-600">
            Manage your news articles and events
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <Select
              options={typeOptions}
              value={filterType}
              onChange={(value) =>
                setFilterType(value as 'all' | 'news' | 'event')
              }
              className="w-full sm:w-40"
            />

            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={(value) =>
                setFilterStatus(
                  value as 'all' | 'published' | 'draft' | 'archived'
                )
              }
              className="w-full sm:w-40"
            />
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{filteredPosts.length} posts found</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm">
        <Table data={filteredPosts} columns={columns} />
      </div>

      {/* Modal */}
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
    </div>
  )
}

export default Posts
