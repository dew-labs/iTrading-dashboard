import React from 'react'
import { Edit2, Trash2, Calendar, Clock, User, MapPin } from 'lucide-react'
import { Table } from '../../../components/molecules'
import { Badge } from '../../../components/atoms'
import RecordImage from '../../../components/features/images/RecordImage'
import { usePageTranslation, useTranslation } from '../../../hooks/useTranslation'

import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import { formatDateDisplay } from '../../../utils/format'
import type { DatabaseUser } from '../../../types'
import { COUNTRY_OPTIONS } from '../../../constants/general'

interface UsersTableProps {
  users: DatabaseUser[]
  imagesByRecord?: Record<string, import('../../../types').Image[]>
  onEdit: (user: DatabaseUser) => void
  onDelete: (user: DatabaseUser) => void
  onSort: (column: keyof DatabaseUser) => void
  sortColumn: keyof DatabaseUser | null
  sortDirection: 'asc' | 'desc'
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  imagesByRecord = {},
  onEdit,
  onDelete,
  onSort,
  sortColumn,
  sortDirection
}) => {
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation()


  const columns = [
    {
      header: t('users.userDetails'),
      accessor: 'email' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown, row: DatabaseUser) => {
        const userImage = imagesByRecord[row.id]?.find(img => img.type === 'avatar')
        return (
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              <RecordImage
                image={userImage || null}
                className='w-12 h-12 rounded-lg object-cover border border-gray-200'
                fallbackClassName='w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'
                alt={`${row.full_name || tCommon('roles.user')} ${tCommon('ui.profileImage')}`}
                fallbackIcon={<User className='w-4 h-4 text-white' />}
              />
            </div>
            <div className='flex-1 min-w-0'>
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>
                {row.full_name || t('users.noName')}
              </div>
              <div className={cn(getTypographyClasses('small'), 'truncate')}>{value as string}</div>
              <div className='flex items-center space-x-2 mt-1'>
                <Badge variant={row.role as 'admin' | 'moderator' | 'user'} size='sm' showIcon>
                  {tCommon(`roles.${row.role}`)}
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
      header: t('forms:labels.location'),
      accessor: 'country' as keyof DatabaseUser,
      sortable: true,
      render: (value: unknown, row: DatabaseUser) => {
        const country = COUNTRY_OPTIONS.find(opt => opt.value === row.country)
        const hasLocation = row.country || row.city

        return (
          <div className={getTypographyClasses('small')}>
            {hasLocation ? (
              <>
                {row.city && (
                  <div className='flex items-center text-gray-900 dark:text-gray-100 mb-1'>
                    <MapPin className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
                    <span className='truncate'>{row.city}</span>
                  </div>
                )}
                {country?.label && (
                  <div className='text-gray-500 dark:text-gray-400 truncate'>
                    {country.label}
                  </div>
                )}
              </>
            ) : (
              <span className='text-gray-400'>{t('users.noLocation')}</span>
            )}
          </div>
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
