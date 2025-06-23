import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Eye
} from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import Table from '../components/Table'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'
import PageLoadingSpinner from '../components/PageLoadingSpinner'
import RecordImage from '../components/RecordImage'
import DetailViewModal from '../components/DetailViewModal'
import Badge from '../components/Badge'
import { PRODUCT_TYPES } from '../constants/general'

import FilterDropdown from '../components/FilterDropdown'
import PaginationSelector from '../components/PaginationSelector'
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
  const [searchTerm, setSearchTerm] = useState('')

  const [filterSubscription, setFilterSubscription] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof Product | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Theme classes
  const layout = getPageLayoutClasses()

  // Enhanced filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesSubscription =
        filterSubscription === 'all' ||
        (filterSubscription === PRODUCT_TYPES.SUBSCRIPTION && product.subscription) ||
        (filterSubscription === PRODUCT_TYPES.ONE_TIME && !product.subscription)

      return matchesSearch && matchesSubscription
    })

    // Sort products
    filtered.sort((a, b) => {
      if (!sortColumn) return 0

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
      case 'subscription':
        aValue = a.subscription ? 1 : 0
        bValue = b.subscription ? 1 : 0
        break
      case 'created_at':
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
        break
      default:
        return 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [products, searchTerm, filterSubscription, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleView = (product: Product) => {
    setViewingProduct(product)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id)
      // Reset to first page if current page becomes empty
      if (paginatedProducts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
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
  }

  // Use predefined filter options from constants
  const subscriptionOptions = [...FILTER_OPTIONS.productType]

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
      header: 'Product Details',
      accessor: 'name' as keyof Product,
      sortable: true,
      render: (value: unknown, row: Product) => {
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <RecordImage
                tableName="products"
                recordId={row.id.toString()}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                fallbackClassName="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center"
                alt={`${value as string} product image`}
                fallbackIcon={<Package className="w-4 h-4 text-white" />}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>{value as string}</div>
              <div className={cn(getTypographyClasses('small'), 'truncate')}>
                {row.description || 'No description'}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={row.subscription ? PRODUCT_TYPES.SUBSCRIPTION : PRODUCT_TYPES.ONE_TIME} size="sm" showIcon>
                  {row.subscription ? 'Subscription' : 'One-time'}
                </Badge>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Pricing',
      accessor: 'price' as keyof Product,
      sortable: true,
      render: (value: unknown, row: Product) => {
        return (
          <div className={getTypographyClasses('small')}>
            <div className="flex items-center text-gray-900 mb-1">
              <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
              <span className="font-medium text-lg">${(value as number).toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500">
              {row.subscription ? 'per month' : 'one-time payment'}
            </div>
          </div>
        )
      }
    },
    {
      header: 'Created Date',
      accessor: 'created_at' as keyof Product,
      sortable: true,
      render: (value: unknown) => {
        return (
          <div className={cn(getTypographyClasses('small'), 'text-gray-900')}>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
              <span>{formatDateDisplay(value as string)}</span>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Product,
      render: (value: unknown, row: Product) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleView(row)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View product details"
          >
            <Eye className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit product"
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleDelete(value as number)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete product"
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  // Stats calculations
  const subscriptionProducts = products.filter((p) => p.subscription).length
  const oneTimeProducts = products.filter((p) => !p.subscription).length
  const totalRevenue = products.reduce((sum, p) => sum + p.price, 0)

  const totalProductsProps = getStatsCardProps('products')
  const subscriptionProps = getStatsCardProps('products')
  const oneTimeProps = getStatsCardProps('products')
  const revenueProps = getStatsCardProps('products')

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message="Loading products..." />
      </div>
    )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)

  return (
    <div className={layout.container}>
      <div className="space-y-6">
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>Products Management</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              Manage your product catalog and pricing
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className={getButtonClasses('primary', 'md')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={layout.grid}>
          <div className={totalProductsProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'products')}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={totalProductsProps.valueClasses}>{products.length}</div>
                <div className={totalProductsProps.labelClasses}>Total Products</div>
              </div>
            </div>
          </div>

          <div className={subscriptionProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'users')}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={subscriptionProps.valueClasses}>{subscriptionProducts}</div>
                <div className={subscriptionProps.labelClasses}>Subscriptions</div>
              </div>
            </div>
          </div>

          <div className={oneTimeProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'posts')}>
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={oneTimeProps.valueClasses}>{oneTimeProducts}</div>
                <div className={oneTimeProps.labelClasses}>One-time</div>
              </div>
            </div>
          </div>

          <div className={revenueProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'banners')}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={revenueProps.valueClasses}>${totalRevenue.toFixed(0)}</div>
                <div className={revenueProps.labelClasses}>Total Value</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Content */}
        <div className={`bg-white shadow-sm border border-gray-200 ${totalPages > 1 ? 'rounded-t-xl' : 'rounded-xl'}`}>
          {/* Enhanced Filters */}
          <div className="p-6 space-y-4">
            {/* Search and filters row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(INPUT_VARIANTS.withIcon, 'py-2')}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FilterDropdown
                  options={subscriptionOptions}
                  value={filterSubscription}
                  onChange={(value) => {
                    setFilterSubscription(value)
                    setCurrentPage(1)
                  }}
                  label="Type"
                />
                <PaginationSelector
                  value={itemsPerPage}
                  onChange={(value) => {
                    setItemsPerPage(value)
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                  totalItems={filteredAndSortedProducts.length}
                />
                <div className={cn('flex items-center space-x-2', getTypographyClasses('small'))}>
                  <Calendar className="w-4 h-4" />
                  <span>
                    Showing {startItem}-{endItem} of {filteredAndSortedProducts.length} products
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table with padding */}
          <div className="px-6 pb-6">
            <Table
              data={paginatedProducts}
              columns={columns}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-xl">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={getButtonClasses('secondary', 'md')}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(getButtonClasses('secondary', 'md'), 'ml-3')}
                >
                  Next
                </button>
              </div>

              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className={getTypographyClasses('small')}>
                    Showing <span className="font-medium">{startItem}</span> to{' '}
                    <span className="font-medium">{endItem}</span> of{' '}
                    <span className="font-medium">{filteredAndSortedProducts.length}</span> results
                  </p>
                </div>

                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-gray-900 border-gray-900 text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingProduct ? 'Edit Product' : 'Create New Product'}
        >
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        </Modal>

        {/* Detail View Modal */}
        {viewingProduct && (
          <DetailViewModal
            isOpen={!!viewingProduct}
            onClose={() => setViewingProduct(null)}
            title={`Product Details: ${viewingProduct.name}`}
            tableName="products"
            recordId={viewingProduct.id.toString()}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{viewingProduct.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <p className="text-gray-900 font-semibold">${viewingProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-gray-900">{viewingProduct.subscription ? 'Subscription' : 'One-time'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-gray-900">{formatDateDisplay(viewingProduct.created_at)}</p>
                </div>
              </div>
              {viewingProduct.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{viewingProduct.description}</p>
                </div>
              )}
            </div>
          </DetailViewModal>
        )}
      </div>
    </div>
  )
}

export default Products
