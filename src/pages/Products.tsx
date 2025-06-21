import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Package, DollarSign, Calendar } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import Table from '../components/Table'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'
import LoadingSpinner from '../components/LoadingSpinner'
import Select from '../components/Select'
import { Product, ProductInsert } from '../types/database'

const Products: React.FC = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubscription, setFilterSubscription] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubscription = filterSubscription === 'all' ||
      (filterSubscription === 'subscription' && product.subscription) ||
      (filterSubscription === 'one-time' && !product.subscription)
    return matchesSearch && matchesSubscription
  })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (data: ProductInsert) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data)
    } else {
      await createProduct(data)
    }
    handleCloseModal()
  }

  const subscriptionOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'one-time', label: 'One-time' }
  ]

  const columns = [
    {
      header: 'Product',
      accessor: 'name' as keyof Product,
      render: (value: string, row: Product) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">
            {row.subscription ? 'Subscription' : 'One-time purchase'}
          </div>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'price' as keyof Product,
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      header: 'Type',
      accessor: 'subscription' as keyof Product,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          {value ? 'Subscription' : 'One-time'}
        </span>
      )
    },
    {
      header: 'Created',
      accessor: 'created_at' as keyof Product,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Product,
      render: (value: number, row: Product) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(value)}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const totalValue = products.reduce((sum, product) => sum + product.price, 0)
  const subscriptionProducts = products.filter(p => p.subscription).length
  const oneTimeProducts = products.filter(p => !p.subscription).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" className="text-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <div className="text-gray-600">Total Products</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</div>
              <div className="text-gray-600">Total Value</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{subscriptionProducts}</div>
              <div className="text-gray-600">Subscriptions</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{oneTimeProducts}</div>
              <div className="text-gray-600">One-time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <Select
              options={subscriptionOptions}
              value={filterSubscription}
              onChange={setFilterSubscription}
              className="w-full sm:w-40"
            />
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{filteredProducts.length} products found</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm">
        <Table data={filteredProducts} columns={columns} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  )
}

export default Products
