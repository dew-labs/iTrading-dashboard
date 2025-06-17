import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Calendar, BarChart3 } from 'lucide-react'
import Table from '../components/Table'
import Modal from '../components/Modal'
import BannerForm from '../components/BannerForm'
import Checkbox from '../components/Checkbox'
import Select from '../components/Select'

interface Banner {
  id: number;
  title: string;
  placement: 'header' | 'sidebar' | 'footer' | 'popup';
  status: 'active' | 'inactive' | 'scheduled';
  startDate: string;
  endDate: string;
  clicks: number;
  impressions: number;
  image: string;
}

const Banners: React.FC = () => {
  const [banners] = useState<Banner[]>([
    {
      id: 1,
      title: 'Summer Sale Campaign',
      placement: 'header',
      status: 'active',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      clicks: 1250,
      impressions: 15400,
      image: 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg'
    },
    {
      id: 2,
      title: 'New Product Launch',
      placement: 'popup',
      status: 'scheduled',
      startDate: '2024-01-20',
      endDate: '2024-01-30',
      clicks: 0,
      impressions: 0,
      image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg'
    },
    {
      id: 3,
      title: 'Holiday Special Offer',
      placement: 'sidebar',
      status: 'inactive',
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      clicks: 890,
      impressions: 12000,
      image: 'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg'
    },
    {
      id: 4,
      title: 'Newsletter Signup',
      placement: 'footer',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      clicks: 567,
      impressions: 8900,
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterPlacement, setFilterPlacement] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [selectedBanners, setSelectedBanners] = useState<number[]>([])

  const placementOptions = [
    { value: 'all', label: 'All Placements' },
    { value: 'header', label: 'Header' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'footer', label: 'Footer' },
    { value: 'popup', label: 'Popup' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'scheduled', label: 'Scheduled' }
  ]

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlacement = filterPlacement === 'all' || banner.placement === filterPlacement
    const matchesStatus = filterStatus === 'all' || banner.status === filterStatus
    return matchesSearch && matchesPlacement && matchesStatus
  })

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    console.log('Delete banner:', id)
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for banners:`, selectedBanners)
    setSelectedBanners([])
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBanner(null)
  }

  const toggleBannerSelection = (id: number) => {
    setSelectedBanners(prev =>
      prev.includes(id) ? prev.filter(bannerId => bannerId !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setSelectedBanners(
      selectedBanners.length === filteredBanners.length ? [] : filteredBanners.map(b => b.id)
    )
  }

  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00'
  }

  const columns = [
    {
      header: (
        <Checkbox
          checked={selectedBanners.length === filteredBanners.length && filteredBanners.length > 0}
          indeterminate={selectedBanners.length > 0 && selectedBanners.length < filteredBanners.length}
          onChange={toggleSelectAll}
          aria-label="Select all banners"
        />
      ),
      accessor: 'id' as keyof Banner,
      render: (value: number) => (
        <Checkbox
          checked={selectedBanners.includes(value)}
          onChange={() => toggleBannerSelection(value)}
          aria-label={`Select banner ${value}`}
        />
      )
    },
    {
      header: 'Banner',
      accessor: 'title' as keyof Banner,
      render: (value: string, row: Banner) => (
        <div className="flex items-center">
          <img
            src={row.image}
            alt={value}
            className="w-12 h-8 rounded object-cover mr-3"
          />
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 capitalize">{row.placement}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as keyof Banner,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800'
            : value === 'scheduled' ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Duration',
      accessor: 'startDate' as keyof Banner,
      render: (value: string, row: Banner) => (
        <div className="text-sm">
          <div>{new Date(value).toLocaleDateString()}</div>
          <div className="text-gray-500">to {new Date(row.endDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      header: 'Performance',
      accessor: 'clicks' as keyof Banner,
      render: (value: number, row: Banner) => (
        <div className="text-sm">
          <div className="font-medium">{value.toLocaleString()} clicks</div>
          <div className="text-gray-500">{row.impressions.toLocaleString()} views</div>
          <div className="text-gray-900">{calculateCTR(value, row.impressions)}% CTR</div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Banner,
      render: (value: number, row: Banner) => (
        <div className="flex space-x-2">
          <button
            onClick={() => console.log('Toggle banner visibility:', value)}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
          >
            {row.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
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

  const totalClicks = banners.reduce((sum, banner) => sum + banner.clicks, 0)
  const totalImpressions = banners.reduce((sum, banner) => sum + banner.impressions, 0)
  const activeBanners = banners.filter(b => b.status === 'active').length
  const averageCTR = calculateCTR(totalClicks, totalImpressions)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
          <p className="mt-1 text-gray-600">Manage your promotional banners and campaigns</p>
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
              <BarChart3 className="w-5 h-5 text-white" />
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
              <Eye className="w-5 h-5 text-white" />
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
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</div>
              <div className="text-gray-600">Total Clicks</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{averageCTR}%</div>
              <div className="text-gray-600">Average CTR</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {selectedBanners.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedBanners.length} selected</span>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200 transition-colors"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <Select
              options={placementOptions}
              value={filterPlacement}
              onChange={setFilterPlacement}
              className="w-full sm:w-48"
            />

            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full sm:w-40"
            />
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{filteredBanners.length} banners found</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm">
        <Table data={filteredBanners} columns={columns} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBanner ? 'Edit Banner' : 'Create New Banner'}
      >
        <BannerForm
          banner={editingBanner}
          onSubmit={(data) => {
            console.log('Banner data:', data)
            handleCloseModal()
          }}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  )
}

export default Banners
