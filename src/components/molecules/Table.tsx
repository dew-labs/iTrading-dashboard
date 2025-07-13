import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '../../utils/theme'
import { KEYBOARD_KEYS } from '../../constants/ui'
import { useTranslation } from '../../hooks/useTranslation'

export type SortDirection = 'asc' | 'desc' | null

interface Column<T> {
  header: string
  accessor: keyof T
  render?: (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  sortColumn?: keyof T | null
  sortDirection?: SortDirection
  onSort?: (column: keyof T) => void
  onRowClick?: (row: T) => void
}

function Table<T extends Record<string, unknown>> ({
  data,
  columns,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick
}: TableProps<T>) {
  const { t } = useTranslation()

  const handleSort = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort(column.accessor)
    }
  }

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null

    const isActive = sortColumn === column.accessor
    const iconClass = 'w-4 h-4 ml-1 transition-colors'

    if (isActive) {
      return sortDirection === 'asc'
        ? <ChevronUp className={cn(iconClass, 'text-blue-500')} />
        : <ChevronDown className={cn(iconClass, 'text-blue-500')} />
    }

    return <ChevronUp className={cn(iconClass, 'text-gray-400 group-hover:text-gray-500')} />
  }

  const handleKeyDown = (e: React.KeyboardEvent, column: Column<T>) => {
    if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
      e.preventDefault()
      handleSort(column)
    }
  }

  return (
    <div className='w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 dark:bg-gray-800'>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.accessor)}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  onClick={() => handleSort(column)}
                  onKeyDown={(e) => handleKeyDown(e, column)}
                  tabIndex={column.sortable ? 0 : -1}
                  role={column.sortable ? 'button' : undefined}
                  aria-sort={
                    sortColumn === column.accessor
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <div className='flex items-center'>
                    {column.header}
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='px-6 py-12 text-center'>
                  <div className='space-y-2'>
                    <div className='mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center'>
                      <svg className='w-6 h-6 text-gray-400 dark:text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5v2m0 4v2'
                        />
                      </svg>
                    </div>
                    <p className='text-gray-500 dark:text-gray-400 font-medium'>{t('messages.noData')}</p>
                    <p className='text-gray-400 dark:text-gray-500 text-sm'>{t('messages.emptyState')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const handleRowClick = (e: React.MouseEvent) => {
                  // Prevent row click if the target is a button or link
                  if (
                    (e.target as HTMLElement).closest('button, a, input, [role="button"], [role="link"]')
                  ) return
                  if (onRowClick) onRowClick(row)
                }
                return (
                  <tr
                    key={rowIndex}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={handleRowClick}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.accessor)}
                        className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'
                      >
                        {column.render
                          ? column.render(row[column.accessor], row)
                          : String(row[column.accessor] || '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
