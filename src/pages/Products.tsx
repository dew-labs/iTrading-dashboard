import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useProductsFiltering } from '../hooks/useProductsFiltering'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import { FilterDropdown, ProductsTable, ProductsStats, Modal, PaginationSelector, Button, Input } from '../components'
import { ProductForm } from '../components/features/products'
import { ConfirmDialog } from '../components/common'
import { PageLoadingSpinner } from '../components/feedback'
import { formatDateDisplay } from '../utils/format'
import type { Product, ProductInsert } from '../types'
import { useQuery } from '@tanstack/react-query'
import { groupImagesByRecord } from '../utils'
import { supabase } from '../lib/supabase'

// Theme imports
import {
  getPageLayoutClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'

const Products: React.FC = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts()
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms

  // Use the filtering hook for all business logic
  const {
    filterState,
    filteredAndSortedProducts,
    paginatedProducts,
    totalPages,
    setSearchTerm,
    setFilterType,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange
  } = useProductsFiltering({ products })

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
      await deleteProduct(confirmDialog.productId)
      setConfirmDialog({ isOpen: false, productId: null, productName: null })
      // Reset to first page if current page becomes empty
      if (paginatedProducts.length === 1 && filterState.currentPage > 1) {
        handlePageChange(filterState.currentPage - 1)
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
        handlePageChange(1)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  // Use predefined filter options
  const typeOptions = [
    { value: 'all', label: tCommon('general.all') },
    { value: 'subscription', label: tCommon('content.subscription') },
    { value: 'oneTime', label: tCommon('content.oneTime') }
  ]

  const productIds = paginatedProducts.map(product => String(product.id))
  const { data: images = [] } = useQuery({
    queryKey: ['images', 'products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return []
      const { data } = await supabase
        .from('images')
        .select('*')
        .eq('table_name', 'products')
        .in('record_id', productIds)
      return data || []
    },
    enabled: productIds.length > 0
  })
  const imagesByRecord = groupImagesByRecord(images)['products'] || {}

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
            <Button
              variant='primary'
              size='md'
              leftIcon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              {t('products.createProduct')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <ProductsStats products={products} />

        {/* Enhanced Filters */}
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm'>
          <div className='p-6 space-y-4'>
            {/* Search and filters row */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4'>
              <div className='flex-1 max-w-md'>
                <Input
                  type='text'
                  placeholder={tCommon('placeholders.searchProductsPlaceholder')}
                  value={filterState.searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  leftIcon={Search}
                  variant='default'
                />
              </div>

              <div className='flex items-center space-x-3'>
                <FilterDropdown
                  options={typeOptions}
                  value={filterState.filterType}
                  onChange={value => {
                    setFilterType(value as 'all' | 'subscription' | 'oneTime')
                    handlePageChange(1)
                  }}
                  label={tCommon('general.type')}
                />
              </div>
            </div>

            {/* Table */}
            <ProductsTable
              products={paginatedProducts}
              imagesByRecord={imagesByRecord}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSort={handleSort}
              sortColumn={filterState.sortColumn}
              sortDirection={filterState.sortDirection}
            />

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-3'>
              <div className='flex items-center space-x-6'>
                <PaginationSelector
                  value={filterState.itemsPerPage}
                  onChange={value => {
                    setItemsPerPage(value)
                    handlePageChange(1) // Reset to first page when changing items per page
                  }}
                />
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700'>
                    {tCommon('pagination.showingRows', {
                      startItem: (filterState.currentPage - 1) * filterState.itemsPerPage + 1,
                      endItem: Math.min(
                        filterState.currentPage * filterState.itemsPerPage,
                        filteredAndSortedProducts.length
                      ),
                      total: filteredAndSortedProducts.length
                    })}
                  </span>
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => handlePageChange(filterState.currentPage - 1)}
                  disabled={filterState.currentPage === 1}
                  className='p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </button>
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700'>{tCommon('pagination.page')}</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <input
                    type='text'
                    value={filterState.pageInputValue}
                    onChange={e => {
                      setPageInputValue(e.target.value)
                    }}
                    onBlur={e => {
                      const page = parseInt(e.target.value)
                      if (!isNaN(page) && page >= 1 && page <= totalPages) {
                        handlePageChange(page)
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const page = parseInt(filterState.pageInputValue)
                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                          handlePageChange(page)
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
                  onClick={() => handlePageChange(filterState.currentPage + 1)}
                  disabled={filterState.currentPage === totalPages}
                  className='p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
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
              {/* Featured Image */}
              {viewingProduct.featured_image_url && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Featured Image
                  </label>
                  <img
                    src={viewingProduct.featured_image_url}
                    alt={`${viewingProduct.name} featured image`}
                    className='w-full max-w-md h-48 object-cover rounded-lg border border-gray-200'
                  />
                </div>
              )}

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
                <p className='text-gray-900'>{viewingProduct.created_at ? formatDateDisplay(viewingProduct.created_at) : 'N/A'}</p>
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
