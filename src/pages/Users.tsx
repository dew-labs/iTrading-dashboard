import React, { useState } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import Table from '../components/Table'
import Modal from '../components/Modal'
import UserForm from '../components/UserForm'
import LoadingSpinner from '../components/LoadingSpinner'
import Select from '../components/Select'
import type { DatabaseUser, UserInsert } from '../types'

const Users: React.FC = () => {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<DatabaseUser | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof DatabaseUser | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesRole = filterRole === 'all' || user.role === filterRole
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
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

  const handleEdit = (user: DatabaseUser) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = async (data: UserInsert) => {
    if (editingUser) {
      await updateUser(editingUser.id, data)
    } else {
      await createUser(data)
    }
    handleCloseModal()
  }

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'invited', label: 'Invited' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const handleSort = (column: keyof DatabaseUser) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const columns = [
    {
      header: 'User',
      accessor: 'email' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown, row: DatabaseUser) => (
        <div>
          <div className="font-medium text-gray-900">{row.full_name || 'No name'}</div>
          <div className="text-sm text-gray-500">{value as string}</div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown) => {
        const role = value as string
        return (
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
              role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {role === 'admin' && <Shield size={12} className="mr-1" />}
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        )
      }
    },
    {
      header: 'Status',
      accessor: 'status' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown) => {
        const status = value as string
        const statusConfig = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          invited: 'bg-yellow-100 text-yellow-800'
        }
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )
      }
    },
    {
      header: 'Last Login',
      accessor: 'last_login' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown) => {
        const lastLogin = value as string | null
        return lastLogin ? new Date(lastLogin).toLocaleDateString() : 'Never'
      }
    },
    {
      header: 'Created',
      accessor: 'created_at' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown) => new Date(value as string).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof DatabaseUser,
      render: (value: unknown, row: DatabaseUser) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(value as string)}
            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  const activeUsers = users.filter((u) => u.status === 'active').length
  const inactiveUsers = users.filter((u) => u.status === 'inactive').length
  const _invitedUsers = users.filter((u) => u.status === 'invited').length
  const adminUsers = users.filter((u) => u.role === 'admin').length

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" className="text-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">{inactiveUsers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admin Users</p>
              <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={roleOptions}
                value={filterRole}
                onChange={setFilterRole}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={statusOptions}
                value={filterStatus}
                onChange={setFilterStatus}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Table
          data={filteredUsers}
          columns={columns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Create New User'}
      >
        <UserForm user={editingUser} onSubmit={handleSubmit} onCancel={handleCloseModal} />
      </Modal>
    </div>
  )
}

export default Users
