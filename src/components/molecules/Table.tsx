import React from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

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
  const handleSort = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort(column.accessor)
    }
  }

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null

    const isActive = sortColumn === column.accessor

    if (!isActive) {
      return <ChevronsUpDown className='w-4 h-4 text-gray-400' />
    }

    return sortDirection === 'asc' ? (
      <ChevronUp className='w-4 h-4 text-gray-700 dark:text-gray-300' />
    ) : (
      <ChevronDown className='w-4 h-4 text-gray-700 dark:text-gray-300' />
    )
  }

  return (
    <div className='overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
          <thead className='bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-gray-700 dark:to-gray-700/80'>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${
                    column.sortable
                      ? 'cursor-pointer select-none hover:bg-gray-100/80 dark:hover:bg-gray-600/20 transition-all duration-200'
                      : ''
                  }`}
                  onClick={() => handleSort(column)}
                >
                  <div className='flex items-center space-x-1'>
                    <span>{column.header}</span>
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700'>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='px-8 py-16 text-center'>
                  <div className='flex flex-col items-center space-y-3'>
                    <div className='w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center'>
                      <svg
                        className='w-6 h-6 text-gray-400 dark:text-gray-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5v2m0 4v2'
                        />
                      </svg>
                    </div>
                    <p className='text-gray-500 dark:text-gray-400 font-medium'>No data available</p>
                    <p className='text-gray-400 dark:text-gray-500 text-sm'>Get started by creating your first item</p>
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
                    className={`hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent dark:hover:from-gray-700/20 dark:hover:to-transparent transition-all duration-200 group ${onRowClick ? 'cursor-pointer' : ''}`}
                    tabIndex={onRowClick ? 0 : undefined}
                    aria-label={onRowClick ? 'View details' : undefined}
                    onClick={onRowClick ? handleRowClick : undefined}
                    onKeyDown={onRowClick ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (onRowClick) onRowClick(row)
                      }
                    } : undefined}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className='px-8 py-6 text-sm text-gray-900 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                      >
                        {column.render
                          ? column.render(row[column.accessor], row)
                          : String(row[column.accessor])}
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
