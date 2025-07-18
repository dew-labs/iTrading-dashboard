import React from 'react'
import { Edit2, Trash2, Eye, EyeOff, Calendar, Link } from 'lucide-react'
import { Table } from '../../../components/molecules'
import { Badge } from '../../../components/atoms'
import RecordImage from '../../../components/features/images/RecordImage'
import { usePageTranslation, useTranslation } from '../../../hooks/useTranslation'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import { formatDateDisplay } from '../../../utils/format'
import type { Banner } from '../../../types'

interface BannersTableProps {
  banners: Banner[]
  imagesByRecord?: Record<string, import('../../../types').Image[]>
  onView: (banner: Banner) => void
  onEdit: (banner: Banner) => void
  onDelete: (banner: Banner) => void
  onToggleStatus: (banner: Banner) => void
  onSort: (column: keyof Banner) => void
  sortColumn: keyof Banner | null
  sortDirection: 'asc' | 'desc'
}

const BannersTable: React.FC<BannersTableProps> = ({
  banners,
  imagesByRecord = {},
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onSort,
  sortColumn,
  sortDirection
}) => {
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation()

  const columns = [
    {
      header: t('banners.bannerDetails'),
      accessor: 'name' as keyof Banner,
      sortable: true,
      render: (value: unknown, row: Banner) => {
        const image = imagesByRecord[row.id]?.[0]
        return (
          <div className='flex items-center space-x-3'>
            <RecordImage
              image={image || null}
              className='w-16 h-10 rounded-md object-cover'
              fallbackClassName='w-16 h-10 rounded-md bg-gray-100 flex items-center justify-center'
              alt={row.name}
            />
            <div className='flex-1 min-w-0'>
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>
                {row.name || tCommon('content.untitledBanner')}
              </div>
              <div className='flex items-center space-x-2 mt-2'>
                <Badge variant={row.is_visible ? 'active' : 'inactive'} size='sm' showIcon>
                  {tCommon(row.is_visible ? 'status.active' : 'status.inactive')}
                </Badge>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: t('banners.targetUrl'),
      accessor: 'id' as keyof Banner,
      render: (value: unknown, row: Banner) => {
        return (
          <div className={getTypographyClasses('small')}>
            {row.target_url ? (
              <div className='flex items-center text-blue-600 hover:text-blue-800'>
                <Link className='w-4 h-4 mr-1' />
                <a
                  href={row.target_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='underline truncate max-w-xs'
                >
                  {row.target_url}
                </a>
              </div>
            ) : (
              <div className='flex items-center text-gray-500'>
                <Link className='w-4 h-4 mr-1' />
                <span>{t('banners.noUrlSet')}</span>
              </div>
            )}
          </div>
        )
      }
    },
    {
      header: t('banners.createdDate'),
      accessor: 'created_at' as keyof Banner,
      sortable: true,
      render: (value: unknown) => {
        return (
          <div className={cn(getTypographyClasses('small'), 'text-gray-900')}>
            <div className='flex items-center'>
              <Calendar className='w-4 h-4 mr-1 text-gray-400' />
              <span>{formatDateDisplay(value as string)}</span>
            </div>
          </div>
        )
      }
    },
    {
      header: t('banners.actions'),
      accessor: 'id' as keyof Banner,
      render: (value: unknown, row: Banner) => (
        <div className='flex space-x-1'>
          <button
            onClick={() => onToggleStatus(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
            title={
              row.is_visible
                ? t('banners.tooltips.deactivateBanner')
                : t('banners.tooltips.activateBanner')
            }
          >
            {row.is_visible ? (
              <Eye className={getIconClasses('action')} />
            ) : (
              <EyeOff className={getIconClasses('action')} />
            )}
          </button>
          <button
            onClick={() => onEdit(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors'
            title={t('banners.tooltips.editBanner')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
            title={t('banners.tooltips.deleteBanner')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  return (
    <Table
      data={banners}
      columns={columns}
      onSort={onSort}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onRowClick={onView}
    />
  )
}

export default React.memo(BannersTable)
