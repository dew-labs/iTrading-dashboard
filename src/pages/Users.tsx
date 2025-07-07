import React, { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { useUsersFiltering } from '../hooks/useUsersFiltering'
import { usePermissions } from '../hooks/usePermissions'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import { FilterDropdown, UsersTable, UsersStats, Modal, TabNavigation, PaginationSelector, Input } from '../components'
import { UserForm } from '../components/features/users'
import { ConfirmDialog } from '../components/common'
import { PageLoadingSpinner } from '../components/feedback'
import { USER_ROLES } from '../constants/general'
import type { DatabaseUser, UserInsert, UserUpdate, Image } from '../types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { groupImagesByRecord } from '../utils'
import { supabase, queryKeys } from '../lib/supabase'
import { useImages } from '../hooks/useImages'
import { useFileUpload } from '../hooks/useFileUpload'

// Theme imports
import {
  getPageLayoutClasses,
  getButtonClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'

const Users: React.FC = () => {
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms
  const { users, loading, createUser, updateUser, deleteUser, isDeleting } = useUsers()
  const { isAdmin } = usePermissions()
  const { createImage, deleteImage } = useImages()
  const { deleteFile } = useFileUpload()
  const queryClient = useQueryClient()

  // Use the filtering hook for all business logic
  const {
    filterState,
    filteredAndSortedUsers,
    paginatedUsers,
    totalPages,
    setSearchTerm,
    setFilterStatus,
    setFilterRole,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange,
    handleTabChange
  } = useUsersFiltering({ users })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<DatabaseUser | null>(null)

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
        id: USER_ROLES.MODERATOR,
        labelKey: 'users.moderators',
        count: 0,
        descriptionKey: 'users.moderatorUsers'
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
      if (paginatedUsers.length === 1 && filterState.currentPage > 1) {
        handlePageChange(filterState.currentPage - 1)
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

  const handleSubmit = async (
    data: Omit<UserInsert, 'id'>,
    avatarImage: (Partial<Image> & { publicUrl?: string; file?: File }) | null | undefined
  ) => {
    try {
      let userId = editingUser?.id

      if (editingUser) {
        // For updating, use UserUpdate type (omitting id, created_at, updated_at)
        const updateData: UserUpdate = {
          email: data.email,
          full_name: data.full_name || null,
          phone: data.phone || null,
          role: data.role || 'user',
          status: data.status || 'active',
          country: data.country || null,
          city: data.city || null,
          bio: data.bio || null
        }
        await updateUser(editingUser.id, updateData)
      } else {
        // For creating, use UserInsert type with id generated by database
        const createData: UserInsert = {
          ...data,
          id: crypto.randomUUID() // Temporary ID that will be overridden by database
        }
        await createUser(createData)

        // To get the new user's ID, we invalidate the query and refetch it.
        await queryClient.invalidateQueries({ queryKey: queryKeys.users() })
        const updatedUsers = await queryClient.fetchQuery<DatabaseUser[]>({
          queryKey: queryKeys.users()
        })
        const newUser = updatedUsers?.find(u => u.email === data.email)
        if (newUser) {
          userId = newUser.id
        }
        // Go to first page to see the new user
        handlePageChange(1)
      }

      if (!userId) {
        if (!editingUser) {
          console.warn("Could not determine new user's ID. Avatar can be added by editing the user.")
          handleCloseModal()
          return
        }
        return
      }

      const existingAvatar = images.find(
        img => img.record_id === userId && img.type === 'avatar'
      )

      // Case 1: Logo removed
      if (!avatarImage && existingAvatar) {
        await deleteImage(existingAvatar.id)
        if (existingAvatar.path) {
          await deleteFile('users', existingAvatar.path)
        }
      }

      // Case 2: New logo added or existing logo changed
      if (avatarImage && avatarImage.file) {
        if (existingAvatar) {
          // A logo exists, so we're replacing it. Delete the old one first.
          await deleteImage(existingAvatar.id)
          if (existingAvatar.path) {
            await deleteFile('users', existingAvatar.path)
          }
        }

        // Create new image record
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { file, publicUrl, ...imageData } = avatarImage
        await createImage({
          ...imageData,
          record_id: userId
        } as Image)
      }

      handleCloseModal()
    } catch (error) {
      console.error('Failed to save user:', error)
    } finally {
      // Invalidate queries to refetch brokers and images
      await queryClient.invalidateQueries({ queryKey: queryKeys.users() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.images() })
    }
  }

  // Use predefined filter options from constants
  const statusOptions = [
    { value: 'all', label: tCommon('general.all') },
    { value: 'active', label: tCommon('status.active') },
    { value: 'inactive', label: tCommon('status.inactive') },
    { value: 'invited', label: tCommon('status.invited') }
  ]

  const roleOptions = [
    { value: 'all', label: tCommon('general.all') },
    { value: 'user', label: tCommon('roles.user') },
    { value: 'admin', label: tCommon('roles.admin') },
    { value: 'moderator', label: tCommon('roles.moderator') }
  ]

  const userIds = paginatedUsers.map(user => String(user.id))
  const { data: images = [] } = useQuery({
    queryKey: ['images', 'users', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return []
      const { data } = await supabase
        .from('images')
        .select('*')
        .eq('table_name', 'users')
        .in('record_id', userIds)
      return data || []
    },
    enabled: userIds.length > 0
  })
  const imagesByRecord = groupImagesByRecord(images)['users'] || {}

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
          {isAdmin() && (
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
        <UsersStats users={users} />

        {/* Tabs with Content Inside */}
        <TabNavigation tabs={tabsWithCounts} activeTab={filterState.activeTab} onTabChange={handleTabChange}>
          {/* Enhanced Filters */}
          <div className='p-6 space-y-4'>
            {/* Search and filters row */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4'>
              <div className='flex-1 max-w-md'>
                <Input
                  type='text'
                  placeholder={tCommon('placeholders.searchUsersPlaceholder')}
                  value={filterState.searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  leftIcon={Search}
                  variant='search'
                />
              </div>

              <div className='flex items-center space-x-3'>
                <FilterDropdown
                  options={statusOptions}
                  value={filterState.filterStatus}
                  onChange={value => {
                    setFilterStatus(value)
                    handlePageChange(1)
                  }}
                  label={tCommon('general.status')}
                />
                <FilterDropdown
                  options={roleOptions}
                  value={filterState.filterRole}
                  onChange={value => {
                    setFilterRole(value)
                    handlePageChange(1)
                  }}
                  label={tCommon('general.role')}
                />
              </div>
            </div>

            {/* Table */}
            <UsersTable
              users={paginatedUsers}
              imagesByRecord={imagesByRecord}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSort={handleSort}
              sortColumn={filterState.sortColumn}
              sortDirection={filterState.sortDirection}
            />

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-3'>
              <div className='flex items-center space-x-6'>
                <PaginationSelector
                  value={filterState.itemsPerPage}
                  onChange={value => {
                    setItemsPerPage(value)
                    handlePageChange(1) // Reset to first page when changing items per page
                  }}
                />
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {tCommon('pagination.showingRows', {
                      startItem: (filterState.currentPage - 1) * filterState.itemsPerPage + 1,
                      endItem: Math.min(filterState.currentPage * filterState.itemsPerPage, filteredAndSortedUsers.length),
                      total: filteredAndSortedUsers.length
                    })}
                  </span>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => handlePageChange(filterState.currentPage - 1)}
                  disabled={filterState.currentPage === 1}
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
                    value={filterState.pageInputValue}
                    onChange={e => {
                      setPageInputValue(e.target.value)
                    }}
                    onBlur={e => {
                      const page = parseInt(e.target.value)
                      if (!isNaN(page) && page >= 1 && page <= totalPages) {
                        handlePageChange(page)
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const page = parseInt(filterState.pageInputValue)
                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                          handlePageChange(page)
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
                  onClick={() => handlePageChange(filterState.currentPage + 1)}
                  disabled={filterState.currentPage === totalPages}
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
          <UserForm user={editingUser} onSubmit={handleSubmit} onCancel={handleCloseModal} images={images} />
        </Modal>

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
