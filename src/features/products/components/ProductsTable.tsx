import React from 'react'
import { Edit2, Trash2, Eye, Package, Calendar } from 'lucide-react'
import { Table } from '../../../components/molecules'
import { Badge } from '../../../components/atoms'
import { usePageTranslation, useTranslation } from '../../../hooks/useTranslation'
import { getTypographyClasses, getIconClasses, cn } from '../../../utils/theme'
import { formatDateDisplay } from '../../../utils/format'
import { stripHtmlAndTruncate } from '../../../utils/textUtils'
import type { Product } from '../../../types'
import RecordImage from '../../../components/features/images/RecordImage'

interface ProductsTableProps {
  products: Product[]
  imagesByRecord?: Record<string, import('../../../types').Image[]>
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onSort: (column: keyof Product) => void
  sortColumn: keyof Product | null
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
  const { t: tCommon } = useTranslation()

  const columns = [
    {
      header: t('products.productDetails'),
      accessor: 'name' as keyof Product,
      sortable: true,
      render: (value: unknown, row: Product) => {
        const image = imagesByRecord[row.id]?.[0]
        return (
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              {image ? (
                <RecordImage image={image} className='w-12 h-12 rounded-lg object-cover border border-gray-200' />
              ) : (
                <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'>
                  <Package className='w-4 h-4 text-white' />
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>{value as string}</div>
              <div className={cn(getTypographyClasses('small'), 'text-gray-600 truncate')}>
                {row.description
                  ? stripHtmlAndTruncate(row.description, 80)
                  : t('products.noDescription')}
              </div>
              <div className='flex items-center space-x-2 mt-1'>
                <Badge variant={row.subscription ? 'subscription' : 'one-time'} size='sm' showIcon>
                  {tCommon(row.subscription ? 'content.subscription' : 'content.oneTime')}
                </Badge>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: t('products.pricing'),
      accessor: 'price' as keyof Product,
      sortable: true,
      render: (value: unknown, row: Product) => {
        const price = value as number
        return (
          <div className={getTypographyClasses('small')}>
            <div className='font-bold text-lg text-gray-900'>${price.toFixed(2)}</div>
            <div className='text-xs text-gray-500'>
              {tCommon(row.subscription ? 'content.perMonth' : 'content.oneTimePayment')}
            </div>
          </div>
        )
      }
    },
    {
      header: t('products.createdDate'),
      accessor: 'created_at' as keyof Product,
      sortable: true,
      render: (value: unknown) => {
        return (
          <div className={getTypographyClasses('small')}>
            <div className='flex items-center text-gray-900'>
              <Calendar className='w-4 h-4 mr-1 text-gray-400' />
              <span>{formatDateDisplay(value as string)}</span>
            </div>
          </div>
        )
      }
    },
    {
      header: t('products.actions'),
      accessor: 'id' as keyof Product,
      render: (value: unknown, row: Product) => (
        <div className='flex space-x-1'>
          <button
            onClick={() => onView(row)}
            className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors'
            title={t('products.tooltips.viewProduct')}
          >
            <Eye className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => onEdit(row)}
            className='p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors'
            title={t('products.tooltips.editProduct')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => onDelete(row)}
            className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
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
    />
  )
}

export default ProductsTable
