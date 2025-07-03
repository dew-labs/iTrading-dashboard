import React from 'react'
import { Edit2, Trash2, Eye, Building2, Calendar, FileText, EyeOff } from 'lucide-react'
import Table from '../../../components/molecules/Table'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { formatDateDisplay } from '../../../utils/format'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import { stripHtmlAndTruncate } from '../../../utils'
import type { Broker } from '../../../types'
import RecordImage from '../../../components/features/images/RecordImage'

interface BrokersTableProps {
  brokers: Broker[]
  imagesByRecord?: Record<string, import('../../../types').Image[]>
  onView: (broker: Broker) => void
  onEdit: (broker: Broker) => void
  onDelete: (broker: Broker) => void
  onToggleVisible?: (broker: Broker) => Promise<void>
  sortColumn: keyof Broker | null
  sortDirection: 'asc' | 'desc'
  onSort: (column: keyof Broker) => void
}

const BrokersTable: React.FC<BrokersTableProps> = ({
  brokers,
  imagesByRecord = {},
  onView,
  onEdit,
  onDelete,
  onToggleVisible,
  sortColumn,
  sortDirection,
  onSort
}) => {
  const { t } = usePageTranslation()

  const handleToggleVisible = async (broker: Broker) => {
    if (typeof onToggleVisible === 'function') {
      await onToggleVisible(broker)
    }
  }

  const columns = [
    {
      header: t('brokers.brokerInformation'),
      accessor: 'name' as keyof Broker,
      sortable: true,
      render: (value: unknown, row: Broker) => (
        <div className='flex items-center space-x-3'>
          <div className='flex-shrink-0'>
            {imagesByRecord?.[row.id]?.[0] ? (
              <RecordImage image={imagesByRecord[row.id]?.[0]} className='w-12 h-12 rounded-lg object-cover border border-gray-200' />
            ) : (
              <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center'>
                <Building2 className='w-4 h-4 text-white' />
              </div>
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <div className={cn(getTypographyClasses('h4'), 'truncate')}>{row.name}</div>
            <div className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300 truncate')}>
              {row.headquarter || t('brokers.noHeadquarterInfo')}
            </div>
            <div className={cn(getTypographyClasses('small'), 'text-gray-500 dark:text-gray-400 truncate')}>
              {row.description
                ? stripHtmlAndTruncate(row.description, 60)
                : t('brokers.noDescription')}
            </div>
          </div>
        </div>
      )
    },
    {
      header: t('brokers.established'),
      accessor: 'established_in' as keyof Broker,
      sortable: true,
      render: (value: unknown) => (
        <div className={cn(getTypographyClasses('small'), 'text-gray-900 dark:text-gray-100')}>
          {value ? (
            <div className='flex items-center'>
              <Calendar className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
              <span>{value as number}</span>
            </div>
          ) : (
            <span className='text-gray-400 dark:text-gray-500'>{t('brokers.notSpecified')}</span>
          )}
        </div>
      )
    },
    {
      header: t('brokers.createdDate'),
      accessor: 'created_at' as keyof Broker,
      sortable: true,
      render: (value: unknown) => (
        <div className={cn(getTypographyClasses('small'), 'text-gray-900 dark:text-gray-100')}>
          <div className='flex items-center'>
            <FileText className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
            <span>{formatDateDisplay(value as string)}</span>
          </div>
        </div>
      )
    },
    {
      header: t('brokers.actions'),
      accessor: 'id' as keyof Broker,
      render: (value: unknown, row: Broker) => (
        <div className='flex space-x-1'>
          <button
            onClick={e => { e.stopPropagation(); handleToggleVisible(row) }}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
            title={row.is_visible ? t('banners.tooltips.deactivateBanner') : t('banners.tooltips.activateBanner')}
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
            title={t('brokers.tooltips.editBroker')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
            title={t('brokers.tooltips.deleteBroker')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  return (
    <Table<Broker>
      data={brokers}
      columns={columns}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onView}
    />
  )
}

export default BrokersTable
