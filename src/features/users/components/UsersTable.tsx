import React from 'react'
import { Edit2, Trash2, Key, Calendar, Clock, User } from 'lucide-react'
import { Table } from '../../../components/molecules'
import { Badge } from '../../../components/atoms'
import { RecordImage } from '../../../components/features/images'
import { usePageTranslation, useTranslation } from '../../../hooks/useTranslation'
import { usePermissions } from '../../../hooks/usePermissions'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import { formatDateDisplay } from '../../../utils/format'
import type { DatabaseUser } from '../../../types'

interface UsersTableProps {
  users: DatabaseUser[]
  onEdit: (user: DatabaseUser) => void
  onDelete: (user: DatabaseUser) => void
  onManagePermissions: (user: DatabaseUser) => void
  onSort: (column: keyof DatabaseUser) => void
  sortColumn: keyof DatabaseUser | null
  sortDirection: 'asc' | 'desc'
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onEdit,
  onDelete,
  onManagePermissions,
  onSort,
  sortColumn,
  sortDirection
}) => {
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation()
  const { isSuperAdmin } = usePermissions()

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
            onClick={() => onEdit(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors'
            title={t('users.editUser')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          {isSuperAdmin() && row.role !== 'user' && (
            <button
              onClick={() => onManagePermissions(row)}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
              title={t('users.managePermissions')}
            >
              <Key className={getIconClasses('action')} />
            </button>
          )}
          <button
            onClick={() => onDelete(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
            title={t('users.deleteUser')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  return (
    <Table
      data={users}
      columns={columns}
      onSort={onSort}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
    />
  )
}

export default UsersTable
