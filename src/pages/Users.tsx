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
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import { Table, FilterDropdown } from '../components/data-display'
import { Modal, TabNavigation, PaginationSelector, Badge, Input } from '../components/ui'
import { UserForm, PermissionManager } from '../components/features/users'
import { RecordImage } from '../components/features/images'
import { ConfirmDialog } from '../components/common'
import { PageLoadingSpinner } from '../components/feedback'
import { USER_ROLES, USER_STATUSES } from '../constants/general'
import type { DatabaseUser, UserInsert, UserUpdate } from '../types'

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
import { FILTER_OPTIONS } from '../constants/components'

const Users: React.FC = () => {
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms
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
  const [pageInputValue, setPageInputValue] = useState('1')

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    userId: string | null
    userName: string | null
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
        labelKey: 'users.allUsers',
        count: 0,
        descriptionKey: 'users.allRegisteredUsers'
      },
      {
        id: USER_ROLES.USER,
        labelKey: 'entities.users',
        count: 0,
        descriptionKey: 'users.regularUsers'
      },
      {
        id: USER_ROLES.ADMIN,
        labelKey: 'users.admins',
        count: 0,
        descriptionKey: 'users.administratorUsers'
      },
      {
        id: USER_ROLES.SUPER_ADMIN,
        labelKey: 'users.superAdmins',
        count: 0,
        descriptionKey: 'users.superAdministratorUsers'
      }
    ]

    return USER_TABS.map(tab => ({
      ...tab,
      label:
        tab.id === 'all'
          ? t(tab.labelKey)
          : tab.labelKey === 'entities.users'
            ? tCommon(tab.labelKey)
            : t(tab.labelKey),
      description: t(tab.descriptionKey),
      count: tab.id === 'all' ? users.length : users.filter(user => user.role === tab.id).length
    }))
  }, [users, t, tCommon])

  // Enhanced filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => {
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
        aValue = a.created_at ? new Date(a.created_at).getTime() : 0
        bValue = b.created_at ? new Date(b.created_at).getTime() : 0
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

  const handleSubmit = async (data: Omit<UserInsert, 'id'>) => {
    try {
      if (editingUser) {
        // For updating, use UserUpdate type (omitting id, created_at, updated_at)
        const updateData: UserUpdate = {
          email: data.email,
          full_name: data.full_name || null,
          phone: data.phone || null,
          role: data.role || 'user',
          status: data.status || 'active',
          avatar_url: data.avatar_url ?? null
        }
        await updateUser(editingUser.id, updateData)
      } else {
        // For creating, use UserInsert type with id generated by database
        const createData: UserInsert = {
          ...data,
          id: crypto.randomUUID() // Temporary ID that will be overridden by database
        }
        await createUser(createData)
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
    setPageInputValue(page.toString())
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
      header: t('users.userDetails'),
      accessor: 'email' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown, row: DatabaseUser) => {
        return (
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              {row.avatar_url ? (
                <img
                  src={row.avatar_url}
                  alt={`${row.full_name || tCommon('roles.user')} ${tCommon('ui.avatar')}`}
                  className='w-12 h-12 rounded-lg object-cover border border-gray-200'
                  onError={e => {
                    // If avatar fails to load, show fallback
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      const fallback = document.createElement('div')
                      fallback.className =
                        'w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'
                      fallback.innerHTML =
                        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-white"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>'
                      parent.appendChild(fallback)
                    }
                  }}
                />
              ) : (
                <RecordImage
                  tableName='users'
                  recordId={row.id}
                  className='w-12 h-12 rounded-lg object-cover border border-gray-200'
                  fallbackClassName='w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'
                  alt={`${row.full_name || tCommon('roles.user')} ${tCommon('ui.profileImage')}`}
                  fallbackIcon={<User className='w-4 h-4 text-white' />}
                />
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>
                {row.full_name || t('users.noName')}
              </div>
              <div className={cn(getTypographyClasses('small'), 'truncate')}>{value as string}</div>
              <div className='flex items-center space-x-2 mt-1'>
                <Badge variant={row.role as 'admin' | 'user' | 'super_admin'} size='sm' showIcon>
                  {tCommon(row.role === 'super_admin' ? 'roles.superAdmin' : `roles.${row.role}`)}
                </Badge>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: tCommon('general.status'),
      accessor: 'id' as keyof DatabaseUser,
      render: (value: unknown, row: DatabaseUser) => {
        return (
          <Badge variant={row.status as 'active' | 'inactive' | 'invited'} size='sm' showIcon>
            {tCommon(`status.${row.status}`)}
          </Badge>
        )
      }
    },
    {
      header: t('users.loginDates'),
      accessor: 'created_at' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown, row: DatabaseUser) => {
        return (
          <div className={getTypographyClasses('small')}>
            <div className='flex items-center text-gray-900 dark:text-gray-100 mb-1'>
              <Clock className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
              <span>
                {t('users.last')}:{' '}
                {row.last_login ? formatDateDisplay(row.last_login) : t('users.never')}
              </span>
            </div>
            <div className='flex items-center text-gray-500 dark:text-gray-400'>
              <Calendar className='w-4 h-4 mr-1' />
              <span>
                {t('users.joined')}: {formatDateDisplay(value as string)}
              </span>
            </div>
          </div>
        )
      }
    },
    {
      header: t('users.actions'),
      accessor: 'id' as keyof DatabaseUser,
      render: (value: unknown, row: DatabaseUser) => (
        <div className='flex space-x-1'>
          <button
            onClick={() => handleEdit(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors'
            title={t('users.editUser')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          {isSuperAdmin() && row.role !== 'user' && (
            <button
              onClick={() => setManagingPermissionsFor(row)}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
              title={t('users.managePermissions')}
            >
              <Key className={getIconClasses('action')} />
            </button>
          )}
          <button
            onClick={() => handleDelete(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
            title={t('users.deleteUser')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  // Stats calculations
  const activeUsers = users.filter(u => u.status === USER_STATUSES.ACTIVE).length
  const invitedUsers = users.filter(u => u.status === USER_STATUSES.INVITED).length
  const adminUsers = users.filter(
    u => u.role === USER_ROLES.ADMIN || u.role === USER_ROLES.SUPER_ADMIN
  ).length

  const totalUsersProps = getStatsCardProps('users')
  const activeUsersProps = getStatsCardProps('users')
  const adminUsersProps = getStatsCardProps('users')
  const invitedUsersProps = getStatsCardProps('users')

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('users.loadingUsers')} />
      </div>
    )
  }

  return (
    <div className={layout.container}>
      <div className='space-y-6'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('users.title')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('users.description')}
            </p>
          </div>
          {isSuperAdmin() && (
            <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
              <button
                onClick={() => setIsModalOpen(true)}
                className={getButtonClasses('primary', 'md')}
              >
                <Plus className='w-4 h-4 mr-2' />
                {t('users.createUser')}
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className={layout.grid}>
          <div className={totalUsersProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'users')}>
                <UsersIcon className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={totalUsersProps.valueClasses}>{users.length}</div>
                <div className={totalUsersProps.labelClasses}>{tCommon('entities.users')}</div>
              </div>
            </div>
          </div>

          <div className={activeUsersProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'posts')}>
                <UserCheck className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={activeUsersProps.valueClasses}>{activeUsers}</div>
                <div className={activeUsersProps.labelClasses}>
                  {tCommon('status.active')} {tCommon('entities.users')}
                </div>
              </div>
            </div>
          </div>

          <div className={adminUsersProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'products')}>
                <Shield className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={adminUsersProps.valueClasses}>{adminUsers}</div>
                <div className={adminUsersProps.labelClasses}>{t('users.adminUsers')}</div>
              </div>
            </div>
          </div>

          <div className={invitedUsersProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'banners')}>
                <UserX className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={invitedUsersProps.valueClasses}>{invitedUsers}</div>
                <div className={invitedUsersProps.labelClasses}>{t('users.pendingInvites')}</div>
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
                  placeholder={tCommon('placeholders.searchUsersPlaceholder')}
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
                    setFilterStatus(value)
                    setCurrentPage(1)
                  }}
                  label={tCommon('general.status')}
                />
                <FilterDropdown
                  options={roleOptions}
                  value={filterRole}
                  onChange={value => {
                    setFilterRole(value)
                    setCurrentPage(1)
                  }}
                  label={tCommon('general.role')}
                />
              </div>
            </div>

            {/* Table */}
            <Table
              columns={columns}
              data={paginatedUsers}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
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
                      endItem: Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length),
                      total: filteredAndSortedUsers.length
                    })}
                  </span>
                </div>
              </div>

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
            </div>
          </div>
        </TabNavigation>

        {/* Modal for creating/editing users */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingUser ? t('users.editUserTitle') : t('users.createNewUser')}
        >
          <UserForm user={editingUser} onSubmit={handleSubmit} onCancel={handleCloseModal} />
        </Modal>

        {/* Modal for managing permissions */}
        {managingPermissionsFor && (
          <Modal
            isOpen={!!managingPermissionsFor}
            onClose={() => setManagingPermissionsFor(null)}
            title={t('users.managePermissionsTitle', {
              userName: managingPermissionsFor.full_name || managingPermissionsFor.email
            })}
          >
            <PermissionManager
              user={managingPermissionsFor}
              onClose={() => setManagingPermissionsFor(null)}
              isSuperAdmin={isSuperAdmin()}
            />
          </Modal>
        )}

        {/* Confirm dialog for deleting users */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
          title={t('users.deleteUserTitle')}
          message={t('users.deleteUserMessage', {
            userName: confirmDialog.userName || t('users.thisUser')
          })}
          confirmLabel={tCommon('actions.delete')}
          cancelLabel={tCommon('actions.cancel')}
          isLoading={isDeleting}
          isDestructive={true}
        />
      </div>
    </div>
  )
}

export default Users
