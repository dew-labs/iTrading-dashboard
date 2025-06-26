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
  Clock
} from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { usePermissions } from '../hooks/usePermissions'
import { useTranslation } from '../hooks/useTranslation'
import Table from '../components/Table'
import Modal from '../components/Modal'
import UserForm from '../components/UserForm'
import PermissionManager from '../components/PermissionManager'
import ConfirmDialog from '../components/ConfirmDialog'
import PageLoadingSpinner from '../components/PageLoadingSpinner'
import TabNavigation from '../components/TabNavigation'
import FilterDropdown from '../components/FilterDropdown'
import PaginationSelector from '../components/PaginationSelector'
import RecordImage from '../components/RecordImage'
import Badge from '../components/Badge'
import { USER_ROLES, USER_STATUSES } from '../constants/general'
import type { DatabaseUser, UserInsert } from '../types'

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

const Users: React.FC = () => {
  const { t } = useTranslation()
  const { users, loading, createUser, updateUser, deleteUser, isDeleting } = useUsers()
  const { isSuperAdmin } = usePermissions()

  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<DatabaseUser | null>(null)
  const [managingPermissionsFor, setManagingPermissionsFor] = useState<DatabaseUser | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof DatabaseUser | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string | null;
  }>({
    isOpen: false,
    userId: null,
    userName: null
  })

  // Theme classes
  const layout = getPageLayoutClasses()

  // Calculate tab counts
  const tabsWithCounts = useMemo(() => {
    // Tab configuration for roles - defined inside useMemo to avoid dependency issues
    const USER_TABS = [
      {
        id: 'all',
        labelKey: 'allUsers',
        count: 0,
        descriptionKey: 'allRegisteredUsers'
      },
      {
        id: USER_ROLES.USER,
        labelKey: 'usersTab',
        count: 0,
        descriptionKey: 'regularUsers'
      },
      {
        id: USER_ROLES.ADMIN,
        labelKey: 'admins',
        count: 0,
        descriptionKey: 'administratorUsers'
      },
      {
        id: USER_ROLES.SUPER_ADMIN,
        labelKey: 'superAdmins',
        count: 0,
        descriptionKey: 'superAdministratorUsers'
      }
    ]

    return USER_TABS.map((tab) => ({
      ...tab,
      label: t(tab.labelKey),
      description: t(tab.descriptionKey),
      count: tab.id === 'all' ? users.length : users.filter((user) => user.role === tab.id).length
    }))
  }, [users, t])

  // Enhanced filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesTab = activeTab === 'all' || user.role === activeTab
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      const matchesRole = filterRole === 'all' || user.role === filterRole
      return matchesSearch && matchesTab && matchesStatus && matchesRole
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
  }, [users, searchTerm, activeTab, filterStatus, filterRole, sortColumn, sortDirection])

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

  const handleDelete = (user: DatabaseUser) => {
    setConfirmDialog({
      isOpen: true,
      userId: user.id,
      userName: user.full_name || user.email
    })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDialog.userId) return

    try {
      await deleteUser(confirmDialog.userId)
      // Reset to first page if current page becomes empty
      if (paginatedUsers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } finally {
      setConfirmDialog({
        isOpen: false,
        userId: null,
        userName: null
      })
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialog({
      isOpen: false,
      userId: null,
      userName: null
    })
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

  // Use predefined filter options from constants
  const statusOptions = [...FILTER_OPTIONS.userStatus]
  const roleOptions = [...FILTER_OPTIONS.userRole]

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
      header: t('userDetails'),
      accessor: 'email' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown, row: DatabaseUser) => {
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {row.avatar_url ? (
                <img
                  src={row.avatar_url}
                  alt={`${row.full_name || t('user')} ${t('avatar')}`}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    // If avatar fails to load, show fallback
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      const fallback = document.createElement('div')
                      fallback.className = 'w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'
                      fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>'
                      parent.appendChild(fallback)
                    }
                  }}
                />
              ) : (
                <RecordImage
                  tableName="users"
                  recordId={row.id}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  fallbackClassName="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
                  alt={`${row.full_name || t('user')} ${t('profileImage')}`}
                  fallbackIcon={<User className="w-4 h-4 text-white" />}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>{row.full_name || t('noName')}</div>
              <div className={cn(getTypographyClasses('small'), 'truncate')}>{value as string}</div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={row.role as 'admin' | 'user' | 'super_admin'} size="sm" showIcon>
                  {t(row.role === 'super_admin' ? 'superAdmin' : row.role)}
                </Badge>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: t('status'),
      accessor: 'id' as keyof DatabaseUser,
      render: (value: unknown, row: DatabaseUser) => {
        return (
          <Badge variant={row.status as 'active' | 'inactive' | 'invited'} size="sm" showIcon>
            {t(row.status)}
          </Badge>
        )
      }
    },
    {
      header: t('loginDates'),
      accessor: 'created_at' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown, row: DatabaseUser) => {
        return (
          <div className={getTypographyClasses('small')}>
            <div className="flex items-center text-gray-900 mb-1">
              <Clock className="w-4 h-4 mr-1 text-gray-400" />
              <span>{t('last')}: {row.last_login ? formatDateDisplay(row.last_login) : t('never')}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{t('joined')}: {formatDateDisplay(value as string)}</span>
            </div>
          </div>
        )
      }
    },
    {
      header: t('actions'),
      accessor: 'id' as keyof DatabaseUser,
      render: (value: unknown, row: DatabaseUser) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
            title={t('editUser')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          {isSuperAdmin() && row.role !== 'user' && (
            <button
              onClick={() => setManagingPermissionsFor(row)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title={t('managePermissions')}
            >
              <Key className={getIconClasses('action')} />
            </button>
          )}
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title={t('deleteUser')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  // Stats calculations
  const activeUsers = users.filter((u) => u.status === USER_STATUSES.ACTIVE).length
  const invitedUsers = users.filter((u) => u.status === USER_STATUSES.INVITED).length
  const adminUsers = users.filter((u) => u.role === USER_ROLES.ADMIN || u.role === USER_ROLES.SUPER_ADMIN).length

  const totalUsersProps = getStatsCardProps('users')
  const activeUsersProps = getStatsCardProps('users')
  const adminUsersProps = getStatsCardProps('users')
  const invitedUsersProps = getStatsCardProps('users')

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('loadingUsers')} />
      </div>
    )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)

  return (
    <div className={layout.container}>
      <div className="space-y-6">
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('usersManagement')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('manageUserAccounts')}
            </p>
          </div>
          {isSuperAdmin() && (
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className={getButtonClasses('primary', 'md')}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('createUser')}
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className={layout.grid}>
          <div className={totalUsersProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'users')}>
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={totalUsersProps.valueClasses}>{users.length}</div>
                <div className={totalUsersProps.labelClasses}>{t('totalUsers')}</div>
              </div>
            </div>
          </div>

          <div className={activeUsersProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'posts')}>
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={activeUsersProps.valueClasses}>{activeUsers}</div>
                <div className={activeUsersProps.labelClasses}>{t('activeUsers')}</div>
              </div>
            </div>
          </div>

          <div className={adminUsersProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'products')}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={adminUsersProps.valueClasses}>{adminUsers}</div>
                <div className={adminUsersProps.labelClasses}>{t('adminUsers')}</div>
              </div>
            </div>
          </div>

          <div className={invitedUsersProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'banners')}>
                <UserX className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={invitedUsersProps.valueClasses}>{invitedUsers}</div>
                <div className={invitedUsersProps.labelClasses}>{t('pendingInvites')}</div>
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
                    placeholder={t('searchUsersPlaceholder')}
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
                    setFilterStatus(value)
                    setCurrentPage(1)
                  }}
                  label={t('status')}
                />
                <FilterDropdown
                  options={roleOptions}
                  value={filterRole}
                  onChange={(value) => {
                    setFilterRole(value)
                    setCurrentPage(1)
                  }}
                  label={t('role')}
                />
                <PaginationSelector
                  value={itemsPerPage}
                  onChange={(value) => {
                    setItemsPerPage(value)
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                  totalItems={filteredAndSortedUsers.length}
                />

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
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={getButtonClasses('secondary', 'md')}
                >
                  {t('previous')}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(getButtonClasses('secondary', 'md'), 'ml-3')}
                >
                  {t('next')}
                </button>
              </div>

              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className={getTypographyClasses('small')}>
                    {t('showing')} <span className="font-medium">{startItem}</span> {t('to')}{' '}
                    <span className="font-medium">{endItem}</span> {t('of')}{' '}
                    <span className="font-medium">{filteredAndSortedUsers.length}</span> {t('results')}
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

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingUser ? t('editUserTitle') : t('createNewUser')}
        >
          <UserForm
            user={editingUser}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        </Modal>

        {/* Permission Manager Modal */}
        {managingPermissionsFor && (
          <Modal
            isOpen={true}
            onClose={() => setManagingPermissionsFor(null)}
            title={t('managePermissionsTitle', {
              userName: managingPermissionsFor.full_name || managingPermissionsFor.email
            })}
          >
            <PermissionManager
              user={managingPermissionsFor}
              onClose={() => setManagingPermissionsFor(null)}
            />
          </Modal>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={t('deleteUserTitle')}
          message={t('deleteUserMessage', {
            userName: confirmDialog.userName || t('thisUser')
          })}
          confirmLabel={t('deleteUser')}
          cancelLabel={t('cancel')}
          isDestructive={true}
          isLoading={isDeleting}
          variant="danger"
        />
      </div>
    </div>
  )
}

export default Users
