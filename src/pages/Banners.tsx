import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Globe, ToggleLeft, ToggleRight } from 'lucide-react'
import { useBanners } from '../hooks/useBanners'
import Table from '../components/Table'
import Modal from '../components/Modal'
import BannerForm from '../components/BannerForm'
import LoadingSpinner from '../components/LoadingSpinner'
import Select from '../components/Select'
import type { Banner, BannerInsert } from '../types'

const Banners: React.FC = () => {
  const { banners, loading, createBanner, updateBanner, deleteBanner } = useBanners()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof Banner | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const filteredBanners = banners
    .filter((banner) => {
      const matchesSearch = banner.target_url
        ? banner.target_url.toLowerCase().includes(searchTerm.toLowerCase())
        : true
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && banner.is_active) ||
        (filterStatus === 'inactive' && !banner.is_active)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (!sortColumn) return 0

      let aValue: string | number | boolean
      let bValue: string | number | boolean

      switch (sortColumn) {
      case 'target_url':
        aValue = (a.target_url || '').toLowerCase()
        bValue = (b.target_url || '').toLowerCase()
        break
      case 'is_active':
        aValue = a.is_active ? 1 : 0
        bValue = b.is_active ? 1 : 0
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

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      await deleteBanner(id)
    }
  }

  const handleToggleStatus = async (banner: Banner) => {
    await updateBanner(banner.id, { is_active: !banner.is_active })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBanner(null)
  }

  const handleSubmit = async (data: BannerInsert) => {
    if (editingBanner) {
      await updateBanner(editingBanner.id, data)
    } else {
      await createBanner(data)
    }
    handleCloseModal()
  }

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const handleSort = (column: keyof Banner) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const columns = [
    {
      header: 'Banner',
      accessor: 'target_url' as keyof Banner,
      sortable: true,
      render: (value: unknown, row: Banner) => (
        <div>
          <div className="font-medium text-gray-900">
            {(value as string | null) || 'No target URL'}
          </div>
          <div className="text-sm text-gray-500">ID: {row.id.slice(0, 8)}...</div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active' as keyof Banner,
      sortable: true,
      render: (value: unknown) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Target URL',
      accessor: 'target_url' as keyof Banner,
      sortable: true,
      render: (value: unknown) => (
        <div className="max-w-xs truncate">
          {value ? (
            <a
              href={value as string}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {value as string}
            </a>
          ) : (
            <span className="text-gray-500">No URL</span>
          )}
        </div>
      )
    },
    {
      header: 'Created',
      accessor: 'created_at' as keyof Banner,
      sortable: true,
      render: (value: unknown) => new Date(value as string).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Banner,
      render: (value: unknown, row: Banner) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleToggleStatus(row)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
            title={row.is_active ? 'Deactivate banner' : 'Activate banner'}
          >
            {row.is_active ? (
              <ToggleLeft className="w-4 h-4" />
            ) : (
              <ToggleRight className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
            title="Edit banner"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(value as string)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete banner"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ]

  const activeBanners = banners.filter((b) => b.is_active).length
  const inactiveBanners = banners.filter((b) => !b.is_active).length

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
          <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
          <p className="mt-1 text-gray-600">Manage your promotional banners</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Banner
        </button>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{banners.length}</div>
              <div className="text-gray-600">Total Banners</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{activeBanners}</div>
              <div className="text-gray-600">Active Banners</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{inactiveBanners}</div>
              <div className="text-gray-600">Inactive Banners</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {((activeBanners / banners.length) * 100 || 0).toFixed(0)}%
              </div>
              <div className="text-gray-600">Active Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full sm:w-40"
            />
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>{filteredBanners.length} banners found</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm">
        <Table
          data={filteredBanners}
          columns={columns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBanner ? 'Edit Banner' : 'Create New Banner'}
      >
        <BannerForm banner={editingBanner} onSubmit={handleSubmit} onCancel={handleCloseModal} />
      </Modal>
    </div>
  )
}

export default Banners
