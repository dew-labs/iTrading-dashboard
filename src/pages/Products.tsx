import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Package, DollarSign } from 'lucide-react'
import Table from '../components/Table'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'
import Select from '../components/Select'

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out-of-stock';
  sku: string;
  image: string;
}

const Products: React.FC = () => {
  const [products] = useState<Product[]>([
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      category: 'Electronics',
      price: 299.99,
      stock: 45,
      status: 'active',
      sku: 'PWH-001',
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'
    },
    {
      id: 2,
      name: 'Smart Fitness Watch',
      category: 'Wearables',
      price: 199.99,
      stock: 0,
      status: 'out-of-stock',
      sku: 'SFW-002',
      image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg'
    },
    {
      id: 3,
      name: 'Ergonomic Office Chair',
      category: 'Furniture',
      price: 449.99,
      stock: 12,
      status: 'active',
      sku: 'EOC-003',
      image: 'https://images.pexels.com/photos/586996/pexels-photo-586996.jpeg'
    },
    {
      id: 4,
      name: 'Professional Camera Lens',
      category: 'Photography',
      price: 899.99,
      stock: 8,
      status: 'inactive',
      sku: 'PCL-004',
      image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const categories = [...new Set(products.map(p => p.category))]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(category => ({ value: category, label: category }))
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    console.log('Delete product:', id)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const columns = [
    {
      header: 'Product',
      accessor: 'name' as keyof Product,
      render: (value: string, row: Product) => (
        <div className="flex items-center">
          <img
            src={row.image}
            alt={value}
            className="w-10 h-10 rounded-lg object-cover mr-3"
          />
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{row.sku}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category' as keyof Product
    },
    {
      header: 'Price',
      accessor: 'price' as keyof Product,
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      header: 'Stock',
      accessor: 'stock' as keyof Product,
      render: (value: number) => (
        <span className={`font-medium ${
          value === 0 ? 'text-red-600'
            : value < 10 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Product,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800'
            : value === 'inactive' ? 'bg-gray-100 text-gray-800'
              : 'bg-red-100 text-red-800'
        }`}>
          {value.replace('-', ' ')}
        </span>
      )
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

  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)
  const lowStockCount = products.filter(p => p.stock < 10 && p.stock > 0).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-gray-600">Manage your product inventory</p>
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
              <div className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</div>
              <div className="text-gray-600">Inventory Value</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{lowStockCount}</div>
              <div className="text-gray-600">Low Stock</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{outOfStockCount}</div>
              <div className="text-gray-600">Out of Stock</div>
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
              options={categoryOptions}
              value={filterCategory}
              onChange={setFilterCategory}
              className="w-full sm:w-48"
            />

            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full sm:w-40"
            />
          </div>

          <div className="text-sm text-gray-600">
            {filteredProducts.length} products found
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
          onSubmit={(data) => {
            console.log('Product data:', data)
            handleCloseModal()
          }}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  )
}

export default Products
