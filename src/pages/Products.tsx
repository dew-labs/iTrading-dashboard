import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import { useProducts } from '../hooks/useProducts'
import { useProductsFiltering } from '../hooks/useProductsFiltering'
import { ProductsTable, ProductsStats, ProductForm } from '../features/products'
import { PaginationSelector } from '../components/molecules'
import { Modal, Button, Input } from '../components/atoms'
import { ConfirmDialog } from '../components/common'
import { PageLoadingSpinner } from '../components/feedback'
import type { ProductWithTranslations, ProductInsert, Image } from '../types'
import { useImages } from '../hooks/useImages'
import { groupImagesByRecord } from '../utils'
import { getPageLayoutClasses, getTypographyClasses, cn } from '../utils/theme'
import ProductViewModal from '../components/features/products/ProductViewModal'

const Products: React.FC = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts()
  const { t } = usePageTranslation()
  const { t: tCommon, i18n } = useTranslation()
  const { images: productImages, createImage, deleteImage } = useImages('products')
  // useTranslation already provides i18n

  // Filtering logic
  const {
    filterState,
    filteredAndSortedProducts,
    paginatedProducts,
    totalPages,
    setSearchTerm,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange
  } = useProductsFiltering({ products })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithTranslations | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    product: ProductWithTranslations | null
    isDeleting: boolean
  }>({
    isOpen: false,
    product: null,
    isDeleting: false
  })
  const [viewingProduct, setViewingProduct] = useState<ProductWithTranslations | null>(null)

  // Theme classes
  const layout = getPageLayoutClasses()

  const handleView = (product: ProductWithTranslations) => {
    setViewingProduct(product)
  }

  const handleEdit = (product: ProductWithTranslations) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = (product: ProductWithTranslations) => {
    setDeleteConfirm({ isOpen: true, product, isDeleting: false })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.product) return
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }))
    try {
      await deleteProduct(deleteConfirm.product.id)
      setDeleteConfirm({ isOpen: false, product: null, isDeleting: false })
      if (paginatedProducts.length === 1 && filterState.currentPage > 1) {
        handlePageChange(filterState.currentPage - 1)
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (
    data: ProductInsert,
    featuredImage: (Partial<Image> & { file?: File }) | null | undefined
  ) => {
    try {
      let productId = editingProduct?.id
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...editingProduct,
          ...data,
          updated_at: new Date().toISOString(),
        })
      } else {
        const now = new Date().toISOString()
        const newProductObj: ProductWithTranslations = {
          id: '', // Supabase will assign
          // name and description are handled via translations, not here
          price: data.price,
          affiliate_link: data.affiliate_link ?? null,
          created_at: now,
          updated_at: now,
          translations: [],
        }
        const newProduct = await createProduct(newProductObj)
        productId = newProduct.id
        handlePageChange(1)
      }
      if (!productId) return
      const existingImage = productImages.find(
        img => img.record_id === productId && img.type === 'featured'
      )
      // Remove image
      if (!featuredImage && existingImage) {
        await deleteImage(existingImage.id)
      }
      // Add or update image
      if (featuredImage && featuredImage.file) {
        if (existingImage) {
          await deleteImage(existingImage.id)
        }
        // Remove 'file', 'publicUrl', and 'url' from the payload before saving
        const { file: _file, publicUrl: _publicUrl, url: _url, ...imageData } = featuredImage as { publicUrl?: string; url?: string; file?: File } & typeof featuredImage
        await createImage({
          ...imageData,
          record_id: productId,
        } as Image)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const imagesByRecord = groupImagesByRecord(productImages)['products'] || {}

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
        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'>
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
                  className='transition-all duration-200 w-full max-w-full focus:w-[32rem]'
                />
              </div>
            </div>
            {/* Table */}
            <ProductsTable
              products={paginatedProducts as ProductWithTranslations[]}
              imagesByRecord={imagesByRecord}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSort={(col) => {
                if (col === 'created_at' || col === 'price') {
                  handleSort(col)
                }
              }}
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
                    handlePageChange(1)
                  }}
                />
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
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
                  className='p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
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
                  <span className='text-sm text-gray-700 dark:text-gray-300'>{tCommon('pagination.page')}</span>
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
                    className='w-12 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-2 dark:focus:ring-white dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200'
                  />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {tCommon('pagination.of')} {totalPages}
                  </span>
                </div>
                <button
                  onClick={() => handlePageChange(filterState.currentPage + 1)}
                  disabled={filterState.currentPage === totalPages}
                  className='p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
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

        {/* Modals */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingProduct ? t('products.editProduct') : t('products.createNewProduct')}
          size='xl'
        >
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            images={productImages}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, product: null, isDeleting: false })}
          onConfirm={confirmDelete}
          title={t('products.deleteProductTitle')}
          message={t('products.deleteConfirmText', {
            name: (() => {
              const lang = i18n.language || 'en';
              const translations = deleteConfirm.product?.translations || [];
              const translation =
                translations.find(tr => tr.language_code === lang) ||
                translations.find(tr => tr.language_code === 'en');
              return translation?.name || t('products.thisProduct');
            })()
          })}
          confirmLabel={tCommon('actions.delete')}
          cancelLabel={tCommon('actions.cancel')}
          isDestructive={true}
          isLoading={deleteConfirm.isDeleting}
          variant='danger'
        />

        {/* Product Viewer Modal (optional, for details) */}
        {viewingProduct && (
          <ProductViewModal
            isOpen={!!viewingProduct}
            onClose={() => setViewingProduct(null)}
            product={viewingProduct}
            image={imagesByRecord[viewingProduct.id]?.[0] ?? null}
            onEdit={() => {
              setEditingProduct(viewingProduct)
              setIsModalOpen(true)
              setViewingProduct(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Products
