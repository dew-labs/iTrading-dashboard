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
  CheckCircle
} from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import Table from '../components/Table'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'
import LoadingSpinner from '../components/LoadingSpinner'
import TabNavigation from '../components/TabNavigation'
import FilterDropdown from '../components/FilterDropdown'
import type { Product, ProductInsert } from '../types'

// Tab configuration for product types
const PRODUCT_TABS = [
  {
    id: 'all',
    label: 'All Products',
    count: 0,
    description: 'All available products'
  },
  {
    id: 'subscription',
    label: 'Subscriptions',
    count: 0,
    description: 'Subscription-based products'
  },
  {
    id: 'one-time',
    label: 'One-time',
    count: 0,
    description: 'One-time purchase products'
  }
]

const Products: React.FC = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')
  const [filterSubscription, setFilterSubscription] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof Product | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Calculate tab counts
  const tabsWithCounts = useMemo(() => {
    return PRODUCT_TABS.map((tab) => ({
      ...tab,
      count: tab.id === 'all'
        ? products.length
        : tab.id === 'subscription'
          ? products.filter((product) => product.subscription).length
          : products.filter((product) => !product.subscription).length
    }))
  }, [products])

  // Enhanced filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm.toLowerCase()))

      let matchesTab = true
      if (activeTab === 'subscription') {
        matchesTab = product.subscription
      } else if (activeTab === 'one-time') {
        matchesTab = !product.subscription
      }

      const matchesSubscription =
        filterSubscription === 'all' ||
        (filterSubscription === 'subscription' && product.subscription) ||
        (filterSubscription === 'one-time' && !product.subscription)

      return matchesSearch && matchesTab && matchesSubscription
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
  }, [products, searchTerm, activeTab, filterSubscription, sortColumn, sortDirection])

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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setCurrentPage(1) // Reset to first page when changing tabs
  }

  const subscriptionOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'one-time', label: 'One-time' }
  ]

  const handleSort = (column: keyof Product) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const getTypeBadge = (isSubscription: boolean) => {
    return isSubscription
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800'
  }

  const columns = [
    {
      header: 'Product Details',
      accessor: 'name' as keyof Product,
      sortable: true,
      render: (value: unknown, row: Product) => {
        return (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{value as string}</div>
              <div className="text-sm text-gray-500 truncate">{row.description || 'No description'}</div>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(
                    row.subscription
                  )}`}
                >
                  {row.subscription ? 'Subscription' : 'One-time'}
                </span>
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
          <div className="text-sm">
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
          <div className="text-sm text-gray-900">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-gray-400" />
              <span>{new Date(value as string).toLocaleDateString()}</span>
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
            onClick={() => handleEdit(row)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(value as number)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const subscriptionProducts = products.filter((p) => p.subscription).length
  const oneTimeProducts = products.filter((p) => !p.subscription).length
  const totalRevenue = products.reduce((sum, p) => sum + p.price, 0)

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-gray-900" />
      </div>
    )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
              <p className="mt-2 text-gray-600">Manage your product catalog and pricing</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Product
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{products.length}</div>
                  <div className="text-gray-600 font-medium">Total Products</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{subscriptionProducts}</div>
                  <div className="text-gray-600 font-medium">Subscriptions</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{oneTimeProducts}</div>
                  <div className="text-gray-600 font-medium">One-time</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(0)}</div>
                  <div className="text-gray-600 font-medium">Total Value</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs with Content Inside */}
          <TabNavigation tabs={tabsWithCounts} activeTab={activeTab} onTabChange={handleTabChange}>
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
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    placeholder="Filter by Type"
                  />
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
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
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>

                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
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
          </TabNavigation>

          {/* Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={editingProduct ? 'Edit Product' : 'Create New Product'}
          >
            <ProductForm product={editingProduct} onSubmit={handleSubmit} onCancel={handleCloseModal} />
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default Products
