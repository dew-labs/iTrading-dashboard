import React from 'react'
import { Edit2, Trash2, Package, Calendar } from 'lucide-react'
import { Table } from '../../../components/molecules'
import { usePageTranslation, useTranslation } from '../../../hooks/useTranslation'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import { formatDateDisplay, formatPrice } from '../../../utils/format'
import { stripHtmlAndTruncate } from '../../../utils/textUtils'
import type { ProductWithTranslations } from '../../../types'
import RecordImage from '../../../components/features/images/RecordImage'

// Local Column type (copied from Table.tsx)
type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
};

interface ProductsTableProps {
  products: ProductWithTranslations[]
  imagesByRecord?: Record<string, import('../../../types').Image[]>
  onView: (product: ProductWithTranslations) => void
  onEdit: (product: ProductWithTranslations) => void
  onDelete: (product: ProductWithTranslations) => void
  onSort: (column: keyof ProductWithTranslations) => void
  sortColumn: keyof ProductWithTranslations | null
  sortDirection: 'asc' | 'desc'
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  imagesByRecord = {},
  onView,
  onEdit,
  onDelete,
  onSort,
  sortColumn,
  sortDirection
}) => {
  const { t } = usePageTranslation()
  const { i18n } = useTranslation()

  function getTranslation(row: ProductWithTranslations) {
    const lang = i18n.language || 'en'
    if (!row.translations) return { name: '', description: '' }
    return (
      row.translations.find(tr => tr.language_code === lang) ||
      row.translations.find(tr => tr.language_code === 'en') ||
      { name: '', description: '' }
    )
  }

  const columns: Column<ProductWithTranslations>[] = [
    {
      header: t('products.productDetails'),
      accessor: 'updated_at', // Use a valid field, but render custom content
      sortable: false,
      render: (_value: unknown, row: ProductWithTranslations) => {
        const image = imagesByRecord[row.id]?.[0]
        const translation = getTranslation(row)
        return (
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              {image ? (
                <RecordImage image={image} className='w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700' />
              ) : (
                <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'>
                  <Package className='w-4 h-4 text-white' />
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>{translation.name || t('products.noName')}</div>
              <div className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300 truncate')}>
                {translation.description
                  ? stripHtmlAndTruncate(translation.description, 80)
                  : t('products.noDescription')}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: t('products.pricing'),
      accessor: 'price',
      sortable: true,
      render: (value: unknown) => {
        const price = value as number
        return (
          <div className={getTypographyClasses('small')}>
            <div className='font-bold text-lg text-gray-900 dark:text-gray-100'>${formatPrice(price)}</div>
          </div>
        )
      }
    },
    {
      header: t('products.affiliateLink'),
      accessor: 'affiliate_link' as keyof ProductWithTranslations,
      sortable: false,
      render: (value: unknown) => {
        const link = value as string | null
        return link ? (
          <a href={link} target='_blank' rel='noopener noreferrer' className='text-blue-600 dark:text-blue-400 underline flex items-center space-x-1'>
            <span>{t('products.affiliateLinkShort')}</span>
            <svg className='w-4 h-4 ml-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 3h7m0 0v7m0-7L10 14m-7 7h7a2 2 0 002-2v-7' />
            </svg>
          </a>
        ) : (
          <span className='text-gray-400 dark:text-gray-500'>-</span>
        )
      }
    },
    {
      header: t('products.createdDate'),
      accessor: 'created_at' as keyof ProductWithTranslations,
      sortable: true,
      render: (value: unknown) => {
        return (
          <div className={getTypographyClasses('small')}>
            <div className='flex items-center text-gray-900 dark:text-gray-100'>
              <Calendar className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
              <span>{formatDateDisplay(value as string)}</span>
            </div>
          </div>
        )
      }
    },
    {
      header: t('products.actions'),
      accessor: 'id' as keyof ProductWithTranslations,
      render: (value: unknown, row: ProductWithTranslations) => (
        <div className='flex space-x-1'>
          <button
            onClick={() => onEdit(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors'
            title={t('products.tooltips.editProduct')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
            title={t('products.tooltips.deleteProduct')}
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
      data={products}
      onSort={onSort}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onRowClick={onView}
    />
  )
}

export default React.memo(ProductsTable)
