import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, Package, Calendar, Tag, TrendingUp } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'

import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import Table from '../components/Table'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'
import ConfirmDialog from '../components/ConfirmDialog'
import PageLoadingSpinner from '../components/PageLoadingSpinner'
import FilterDropdown from '../components/FilterDropdown'
import PaginationSelector from '../components/PaginationSelector'
import RecordImage from '../components/RecordImage'
import Badge from '../components/Badge'
import { stripHtmlAndTruncate } from '../utils/textUtils'
import type { Product, ProductInsert } from '../types'

// Theme imports
import {
  getPageLayoutClasses,
  getButtonClasses,
  getStatsCardProps,
  getIconClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'
import { formatDateDisplay } from '../utils/format'
import { INPUT_VARIANTS, FILTER_OPTIONS } from '../constants/components'

const Products: React.FC = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts()
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'subscription' | 'oneTime'>('all')
  const [sortColumn, setSortColumn] = useState<keyof Product | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [pageInputValue, setPageInputValue] = useState('1')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    productId: string | null
    productName: string | null
  }>({
    isOpen: false,
    productId: null,
    productName: null
  })

  // Theme classes
  const layout = getPageLayoutClasses()

  // Enhanced filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType =
        filterType === 'all' ||
        (filterType === 'subscription' && product.subscription) ||
        (filterType === 'oneTime' && !product.subscription)

      return matchesSearch && matchesType
    })

    // Sort products
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortColumn) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'price':
        aValue = a.price
        bValue = b.price
        break
      case 'created_at':
      default:
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [products, searchTerm, filterType, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleView = (product: Product) => {
    setViewingProduct(product)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = (product: Product) => {
    setConfirmDialog({
      isOpen: true,
      productId: product.id.toString(),
      productName: product.name
    })
  }

  const confirmDelete = async () => {
    if (!confirmDialog.productId) return

    try {
      await deleteProduct(parseInt(confirmDialog.productId))
      setConfirmDialog({ isOpen: false, productId: null, productName: null })
      // Reset to first page if current page becomes empty
      if (paginatedProducts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (data: ProductInsert) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
      } else {
        await createProduct(data)
        // Go to first page to see the new product
        setCurrentPage(1)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setPageInputValue(page.toString())
  }

  // Use predefined filter options from constants
  const typeOptions = [...FILTER_OPTIONS.productType]

  const handleSort = (column: keyof Product) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const columns = [
    {
      header: t('products.productDetails'),
      accessor: 'name' as keyof Product,
      sortable: true,
      render: (value: unknown, row: Product) => {
        return (
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              <RecordImage
                tableName='products'
                recordId={row.id.toString()}
                className='w-12 h-12 rounded-lg object-cover border border-gray-200'
                fallbackClassName='w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center'
                alt={`${value as string} product image`}
                fallbackIcon={<Package className='w-4 h-4 text-white' />}
              />
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
            onClick={() => handleView(row)}
            className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors'
            title={t('products.tooltips.viewProduct')}
          >
            <Eye className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className='p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors'
            title={t('products.tooltips.editProduct')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors'
            title={t('products.tooltips.deleteProduct')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  // Stats calculations
  const subscriptionProducts = products.filter(p => p.subscription).length
  const oneTimeProducts = products.filter(p => !p.subscription).length
  const totalValue = products.reduce((sum, p) => sum + p.price, 0)

  const totalProductsProps = getStatsCardProps('products')
  const subscriptionProps = getStatsCardProps('products')
  const oneTimeProps = getStatsCardProps('products')
  const revenueProps = getStatsCardProps('products')

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('products.loadingProducts')} />
      </div>
    )
  }

  return (
    <div className={layout.container}>
      <div className='space-y-6'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('products.title')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('products.description')}
            </p>
          </div>
          <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
            <button
              onClick={() => setIsModalOpen(true)}
              className={getButtonClasses('primary', 'md')}
            >
              <Plus className='w-4 h-4 mr-2' />
              {t('products.createProduct')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={layout.grid}>
          <div className={totalProductsProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'products')}>
                <Package className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={totalProductsProps.valueClasses}>{products.length}</div>
                <div className={totalProductsProps.labelClasses}>{t('products.totalProducts')}</div>
              </div>
            </div>
          </div>

          <div className={subscriptionProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'posts')}>
                <Calendar className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={subscriptionProps.valueClasses}>{subscriptionProducts}</div>
                <div className={subscriptionProps.labelClasses}>{t('products.subscriptions')}</div>
              </div>
            </div>
          </div>

          <div className={oneTimeProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'banners')}>
                <Tag className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={oneTimeProps.valueClasses}>{oneTimeProducts}</div>
                <div className={oneTimeProps.labelClasses}>{t('products.oneTimeProducts')}</div>
              </div>
            </div>
          </div>

          <div className={revenueProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'users')}>
                <TrendingUp className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={revenueProps.valueClasses}>${totalValue.toLocaleString()}</div>
                <div className={revenueProps.labelClasses}>{t('products.totalValue')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm'>
          <div className='p-6 space-y-4'>
            {/* Search and filters row */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4'>
              <div className='flex-1 max-w-md'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder={tCommon('placeholders.searchProductsPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={cn(INPUT_VARIANTS.withIcon, 'py-2')}
                  />
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <FilterDropdown
                  options={typeOptions}
                  value={filterType}
                  onChange={value => {
                    setFilterType(value as 'all' | 'subscription' | 'oneTime')
                    setCurrentPage(1)
                  }}
                  label={tCommon('general.type')}
                />
              </div>
            </div>

            {/* Table */}
            <Table
              columns={columns}
              data={paginatedProducts}
              onSort={handleSort}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
            />

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-3'>
              <div className='flex items-center space-x-6'>
                <PaginationSelector
                  value={itemsPerPage}
                  onChange={value => {
                    setItemsPerPage(value)
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                />
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700'>
                    {tCommon('pagination.showingRows', {
                      startItem: (currentPage - 1) * itemsPerPage + 1,
                      endItem: Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length),
                      total: filteredAndSortedProducts.length
                    })}
                  </span>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className='p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                  </svg>
                </button>
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700'>
                    {tCommon('pagination.page')}
                  </span>
                </div>
                <div className='flex items-center space-x-1'>
                  <input
                    type='text'
                    value={pageInputValue}
                    onChange={e => {
                      setPageInputValue(e.target.value)
                    }}
                    onBlur={e => {
                      const page = parseInt(e.target.value)
                      if (!isNaN(page) && page >= 1 && page <= totalPages) {
                        handlePageChange(page)
                      } else {
                        setPageInputValue(currentPage.toString())
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const page = parseInt(pageInputValue)
                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                          handlePageChange(page)
                        } else {
                          setPageInputValue(currentPage.toString())
                        }
                      }
                    }}
                    className='w-12 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  />
                  <span className='text-sm text-gray-700'>
                    {tCommon('pagination.of')} {totalPages}
                  </span>
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className='p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for creating/editing products */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingProduct ? t('products.editProduct') : t('products.createNewProduct')}
        >
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        </Modal>

        {/* Modal for viewing product details */}
        {viewingProduct && (
          <Modal
            isOpen={!!viewingProduct}
            onClose={() => setViewingProduct(null)}
            title={`${t('products.productDetails')}: ${viewingProduct.name}`}
          >
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {tCommon('general.name')}
                </label>
                <p className='text-gray-900'>{viewingProduct.name}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {tCommon('general.price')}
                </label>
                <p className='text-gray-900'>${viewingProduct.price}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {tCommon('general.type')}
                </label>
                <p className='text-gray-900'>
                  {tCommon(
                    viewingProduct.subscription ? 'content.subscription' : 'content.oneTime'
                  )}
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {tCommon('general.date')}
                </label>
                <p className='text-gray-900'>{formatDateDisplay(viewingProduct.created_at)}</p>
              </div>
              {viewingProduct.description && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    {tCommon('general.description')}
                  </label>
                  <div className='text-gray-900 prose prose-sm max-w-none'>
                    <div dangerouslySetInnerHTML={{ __html: viewingProduct.description }} />
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Confirm dialog for deleting products */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onConfirm={confirmDelete}
          onClose={() => setConfirmDialog({ isOpen: false, productId: null, productName: null })}
          title={t('products.deleteProductTitle')}
          message={t('products.deleteProductMessage', {
            productName: confirmDialog.productName || t('products.thisProduct')
          })}
          confirmLabel={tCommon('actions.delete')}
          cancelLabel={tCommon('actions.cancel')}
          isDestructive={true}
        />
      </div>
    </div>
  )
}

export default Products
