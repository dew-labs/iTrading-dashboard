import React from 'react'
import { Edit2, Trash2, Building2, Calendar } from 'lucide-react'
import { Table } from '../../molecules'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { formatDateDisplay } from '../../../utils/format'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import type { BrokerCategory } from '../../../types'

// Local Column type (copied from Table.tsx)
type Column<T> = {
  header: string
  accessor: keyof T
  render?: (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
}

interface BrokerCategoriesTableProps {
  brokerCategories: BrokerCategory[]
  onEdit: (category: BrokerCategory) => void
  onDelete: (category: BrokerCategory) => void
}

const BrokerCategoriesTable: React.FC<BrokerCategoriesTableProps> = ({
  brokerCategories,
  onEdit,
  onDelete
}) => {
  const { t } = usePageTranslation()

  const columns: Column<BrokerCategory>[] = [
    {
      header: t('brokerCategories.table.name'),
      accessor: 'name',
      sortable: true,
      render: (value: unknown, _row: BrokerCategory) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              'bg-blue-100 dark:bg-blue-900/20'
            )}>
              <Building2 className={cn(getIconClasses('action'), 'text-blue-600 dark:text-blue-400')} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(getTypographyClasses('base'), 'font-medium truncate')}>
              {value as string}
            </p>
          </div>
        </div>
      )
    },
    {
      header: t('brokerCategories.table.createdAt'),
      accessor: 'created_at',
      sortable: true,
      render: (value: unknown) => (
        <div className="flex items-center space-x-2">
          <Calendar className={cn(getIconClasses('action'), 'text-gray-400')} />
          <span className={getTypographyClasses('caption')}>
            {formatDateDisplay(value as string)}
          </span>
        </div>
      )
    },
    {
      header: t('brokerCategories.table.actions'),
      accessor: 'id',
      render: (value: unknown, row: BrokerCategory) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => onEdit(row)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-gray-500 hover:text-blue-600 hover:bg-blue-50',
              'dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
            )}
            title={t('brokerCategories.actions.edit')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-gray-500 hover:text-red-600 hover:bg-red-50',
              'dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20'
            )}
            title={t('brokerCategories.actions.delete')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  return (
    <Table
      columns={columns}
      data={brokerCategories}
    />
  )
}

export default BrokerCategoriesTable