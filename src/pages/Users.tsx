import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Shield,
  Key,
  Calendar,
  User,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { usePermissions } from '../hooks/usePermissions'
import Table from '../components/Table'
import Modal from '../components/Modal'
import UserForm from '../components/UserForm'
import PermissionManager from '../components/PermissionManager'
import LoadingSpinner from '../components/LoadingSpinner'
import TabNavigation from '../components/TabNavigation'
import FilterDropdown from '../components/FilterDropdown'
import type { DatabaseUser, UserInsert } from '../types'

// Tab configuration for roles
const USER_TABS = [
  {
    id: 'all',
    label: 'All Users',
    count: 0,
    description: 'All registered users'
  },
  {
    id: 'user',
    label: 'Users',
    count: 0,
    description: 'Regular users'
  },
  {
    id: 'admin',
    label: 'Admins',
    count: 0,
    description: 'Administrator users'
  },
  {
    id: 'super_admin',
    label: 'Super Admins',
    count: 0,
    description: 'Super administrator users'
  }
]

const Users: React.FC = () => {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers()
  const { isSuperAdmin } = usePermissions()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<DatabaseUser | null>(null)
  const [managingPermissionsFor, setManagingPermissionsFor] = useState<DatabaseUser | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof DatabaseUser | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Calculate tab counts
  const tabsWithCounts = useMemo(() => {
    return USER_TABS.map((tab) => ({
      ...tab,
      count: tab.id === 'all' ? users.length : users.filter((user) => user.role === tab.id).length
    }))
  }, [users])

  // Enhanced filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesRole = activeTab === 'all' || user.role === activeTab
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      return matchesSearch && matchesRole && matchesStatus
    })

    // Sort users
    filtered.sort((a, b) => {
      if (!sortColumn) return 0

      let aValue: string | number | null
      let bValue: string | number | null

      switch (sortColumn) {
      case 'email':
        aValue = a.email.toLowerCase()
        bValue = b.email.toLowerCase()
        break
      case 'full_name':
        aValue = (a.full_name || '').toLowerCase()
        bValue = (b.full_name || '').toLowerCase()
        break
      case 'role':
        aValue = a.role
        bValue = b.role
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'last_login':
        aValue = a.last_login ? new Date(a.last_login).getTime() : 0
        bValue = b.last_login ? new Date(b.last_login).getTime() : 0
        break
      case 'created_at':
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
        break
      default:
        return 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [users, searchTerm, activeTab, filterStatus, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEdit = (user: DatabaseUser) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id)
      // Reset to first page if current page becomes empty
      if (paginatedUsers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = async (data: UserInsert) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, data)
      } else {
        await createUser(data)
        // Go to first page to see the new user
        setCurrentPage(1)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setCurrentPage(1) // Reset to first page when changing tabs
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'invited', label: 'Invited' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ]

  const handleSort = (column: keyof DatabaseUser) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
    case 'user':
      return 'bg-gray-100 text-gray-800'
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'super_admin':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    case 'invited':
      return 'bg-yellow-100 text-yellow-800'
    case 'suspended':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRoleLabel = (role: string) => {
    switch (role) {
    case 'super_admin':
      return 'Super Admin'
    default:
      return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  const columns = [
    {
      header: 'User Details',
      accessor: 'email' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown, row: DatabaseUser) => {
        return (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{row.full_name || 'No name'}</div>
              <div className="text-sm text-gray-500 truncate">{value as string}</div>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(
                    row.role
                  )}`}
                >
                  {(row.role === 'admin' || row.role === 'super_admin') && (
                    <Shield className="w-3 h-3 mr-1" />
                  )}
                  {formatRoleLabel(row.role)}
                </span>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Status',
      accessor: 'id' as keyof DatabaseUser,
      render: (value: unknown, row: DatabaseUser) => {
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
      header: 'Login & Dates',
      accessor: 'created_at' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown, row: DatabaseUser) => {
        return (
          <div className="text-sm">
            <div className="flex items-center text-gray-900 mb-1">
              <Clock className="w-4 h-4 mr-1 text-gray-400" />
              <span>Last: {row.last_login ? new Date(row.last_login).toLocaleDateString() : 'Never'}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Joined: {new Date(value as string).toLocaleDateString()}</span>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof DatabaseUser,
      render: (value: unknown, row: DatabaseUser) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit user"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {isSuperAdmin() && (
            <button
              onClick={() => setManagingPermissionsFor(row)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Manage permissions"
            >
              <Key className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDelete(value as string)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const activeUsers = users.filter((u) => u.status === 'active').length
  const invitedUsers = users.filter((u) => u.status === 'invited').length
  const adminUsers = users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" className="text-gray-900" />
      </div>
    )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              <div className="text-gray-600">Total Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{activeUsers}</div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{adminUsers}</div>
              <div className="text-gray-600">Admin Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{invitedUsers}</div>
              <div className="text-gray-600">Pending Invites</div>
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
                  placeholder="Search users by name or email..."
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
                  setFilterStatus(value)
                  setCurrentPage(1)
                }}
                placeholder="Filter by Status"
              />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Showing {startItem}-{endItem} of {filteredAndSortedUsers.length} users
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table with padding */}
        <div className="px-6 pb-6">
          <Table
            data={paginatedUsers}
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
                  <span className="font-medium">{filteredAndSortedUsers.length}</span> results
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
        title={editingUser ? 'Edit User' : 'Create New User'}
      >
        <UserForm user={editingUser} onSubmit={handleSubmit} onCancel={handleCloseModal} />
      </Modal>

      <Modal
        isOpen={!!managingPermissionsFor}
        onClose={() => setManagingPermissionsFor(null)}
        title="Manage Permissions"
      >
        {managingPermissionsFor && (
          <PermissionManager
            user={managingPermissionsFor}
            onClose={() => setManagingPermissionsFor(null)}
          />
        )}
      </Modal>
    </div>
  )
}

export default Users
