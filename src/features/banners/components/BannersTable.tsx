import React from 'react'
import { Edit2, Trash2, Image, Eye, EyeOff, Calendar, Link } from 'lucide-react'
import { Table } from '../../../components/molecules'
import { Badge } from '../../../components/atoms'
import { RecordImage } from '../../../components/features/images'
import { usePageTranslation, useTranslation } from '../../../hooks/useTranslation'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import { formatDateDisplay } from '../../../utils/format'
import type { Banner } from '../../../types'

interface BannersTableProps {
  banners: Banner[]
  onEdit: (banner: Banner) => void
  onDelete: (banner: Banner) => void
  onToggleStatus: (banner: Banner) => void
  onSort: (column: keyof Banner) => void
  sortColumn: keyof Banner | null
  sortDirection: 'asc' | 'desc'
}

const BannersTable: React.FC<BannersTableProps> = ({
  banners,
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
        return (
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              <RecordImage
                tableName='banners'
                recordId={row.id}
                className='w-12 h-12 rounded-lg object-cover border border-gray-200'
                fallbackClassName='w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center'
                alt={`Banner ${row.id.slice(0, 8)} image`}
                fallbackIcon={<Image className='w-4 h-4 text-white' />}
              />
            </div>
            <div className='flex-1 min-w-0'>
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>
                {row.name || 'Untitled Banner'}
              </div>
              <div className='flex items-center space-x-2 mt-2'>
                <Badge variant={row.is_active ? 'active' : 'inactive'} size='sm' showIcon>
                  {tCommon(row.is_active ? 'status.active' : 'status.inactive')}
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
              row.is_active
                ? t('banners.tooltips.deactivateBanner')
                : t('banners.tooltips.activateBanner')
            }
          >
            {row.is_active ? (
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
    />
  )
}

export default BannersTable
