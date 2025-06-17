import React, { useState } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Mail
} from 'lucide-react'
import Table from '../components/Table'
import Modal from '../components/Modal'
import UserForm from '../components/UserForm'
import Checkbox from '../components/Checkbox'
import Select from '../components/Select'

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  joinDate: string;
  avatar: string;
  department?: string;
  phone?: string;
}

const Users: React.FC = () => {
  const [users] = useState<User[]>([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      joinDate: '2023-06-15',
      avatar:
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      department: 'IT',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      role: 'editor',
      status: 'active',
      lastLogin: '2024-01-14T16:45:00Z',
      joinDate: '2023-08-22',
      avatar:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      department: 'Marketing',
      phone: '+1 (555) 234-5678'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'editor',
      status: 'inactive',
      lastLogin: '2024-01-10T09:15:00Z',
      joinDate: '2023-04-10',
      avatar:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      department: 'Sales',
      phone: '+1 (555) 345-6789'
    },
    {
      id: 4,
      name: 'Emma Davis',
      email: 'emma.davis@company.com',
      role: 'viewer',
      status: 'pending',
      lastLogin: '2024-01-12T14:20:00Z',
      joinDate: '2024-01-01',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      department: 'HR',
      phone: '+1 (555) 456-7890'
    },
    {
      id: 5,
      name: 'Alex Chen',
      email: 'alex.chen@company.com',
      role: 'editor',
      status: 'active',
      lastLogin: '2024-01-15T11:00:00Z',
      joinDate: '2023-09-05',
      avatar:
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
      department: 'Design',
      phone: '+1 (555) 567-8901'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])

  const departments = [
    ...new Set(users.map((u) => u.department).filter(Boolean))
  ]

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Viewer' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ]

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    ...departments.map((dept) => ({ value: dept!, label: dept! }))
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus =
      filterStatus === 'all' || user.status === filterStatus
    const matchesDepartment =
      filterDepartment === 'all' || user.department === filterDepartment
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    console.log('Delete user:', id)
  }

  const handleStatusToggle = (id: number) => {
    console.log('Toggle user status:', id)
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for users:`, selectedUsers)
    setSelectedUsers([])
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const toggleUserSelection = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map((u) => u.id)
    )
  }

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const columns = [
    {
      header: (
        <Checkbox
          checked={
            selectedUsers.length === filteredUsers.length &&
            filteredUsers.length > 0
          }
          indeterminate={
            selectedUsers.length > 0 &&
            selectedUsers.length < filteredUsers.length
          }
          onChange={toggleSelectAll}
          aria-label="Select all users"
        />
      ),
      accessor: 'id' as keyof User,
      render: (value: number) => (
        <Checkbox
          checked={selectedUsers.includes(value)}
          onChange={() => toggleUserSelection(value)}
          aria-label={`Select user ${value}`}
        />
      )
    },
    {
      header: 'User',
      accessor: 'name' as keyof User,
      render: (value: string, row: User) => (
        <div className="flex items-center">
          <img
            src={row.avatar}
            alt={value}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role' as keyof User,
      render: (value: string) => (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
            value === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : value === 'editor'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          <Shield className="w-3 h-3 mr-1" />
          {value}
        </span>
      )
    },
    {
      header: 'Department',
      accessor: 'department' as keyof User,
      render: (value: string) => value || 'N/A'
    },
    {
      header: 'Status',
      accessor: 'status' as keyof User,
      render: (value: string) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value === 'active'
              ? 'bg-green-100 text-green-800'
              : value === 'inactive'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {value}
        </span>
      )
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin' as keyof User,
      render: (value: string) => (
        <div className="text-sm text-gray-900">{formatLastLogin(value)}</div>
      )
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof User,
      render: (value: number, row: User) => (
        <div className="flex space-x-2">
          <button
            onClick={() => console.log('Send email to:', row.email)}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Send email"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleStatusToggle(value)}
            className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title={
              row.status === 'active' ? 'Deactivate user' : 'Activate user'
            }
          >
            {row.status === 'active' ? (
              <UserX className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
            title="Edit user"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(value)}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'active').length
  const pendingUsers = users.filter((u) => u.status === 'pending').length
  const adminUsers = users.filter((u) => u.role === 'admin').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {totalUsers}
              </div>
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
              <div className="text-2xl font-bold text-gray-900">
                {activeUsers}
              </div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {pendingUsers}
              </div>
              <div className="text-gray-600">Pending Users</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {adminUsers}
              </div>
              <div className="text-gray-600">Administrators</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} selected
                </span>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('email')}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  Send Email
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <Select
              options={roleOptions}
              value={filterRole}
              onChange={setFilterRole}
              className="w-full sm:w-32"
            />

            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full sm:w-32"
            />

            <Select
              options={departmentOptions}
              value={filterDepartment}
              onChange={setFilterDepartment}
              className="w-full sm:w-40"
            />
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>{filteredUsers.length} users found</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm">
        <Table data={filteredUsers} columns={columns} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <UserForm
          user={editingUser}
          onSubmit={(data) => {
            console.log('User data:', data)
            handleCloseModal()
          }}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  )
}

export default Users
