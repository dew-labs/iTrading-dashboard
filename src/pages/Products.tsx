import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Package, DollarSign, Calendar } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import Table from '../components/Table'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'
import LoadingSpinner from '../components/LoadingSpinner'
import Select from '../components/Select'
import type { Product, ProductInsert } from '../types'

const Products: React.FC = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubscription, setFilterSubscription] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubscription =
      filterSubscription === 'all' ||
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
      render: (value: unknown, row: Product) => (
        <div>
          <div className="font-medium text-gray-900">{value as string}</div>
          <div className="text-sm text-gray-500">
            {row.subscription ? 'Subscription' : 'One-time purchase'}
          </div>
        </div>
      )
    },
    {
      header: 'Price',
      accessor: 'price' as keyof Product,
      render: (value: unknown) => `$${(value as number).toFixed(2)}`
    },
    {
      header: 'Type',
      accessor: 'subscription' as keyof Product,
      render: (value: unknown) => {
        const isSubscription = value as boolean
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              isSubscription ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {isSubscription ? 'Subscription' : 'One-time'}
          </span>
        )
      }
    },
    {
      header: 'Created',
      accessor: 'created_at' as keyof Product,
      render: (value: unknown) => new Date(value as string).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Product,
      render: (value: unknown, row: Product) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(value as number)}
            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  const subscriptionProducts = products.filter((p) => p.subscription).length
  const oneTimeProducts = products.filter((p) => !p.subscription).length

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" className="text-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Subscription Products</p>
              <p className="text-2xl font-bold text-gray-900">{subscriptionProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">One-time Products</p>
              <p className="text-2xl font-bold text-gray-900">{oneTimeProducts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={subscriptionOptions}
                value={filterSubscription}
                onChange={setFilterSubscription}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <Table data={filteredProducts} columns={columns} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Create New Product'}
      >
        <ProductForm product={editingProduct} onSubmit={handleSubmit} onCancel={handleCloseModal} />
      </Modal>
    </div>
  )
}

export default Products
