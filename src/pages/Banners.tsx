import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Link,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useBanners } from '../hooks/useBanners'
import Table from '../components/Table'
import Modal from '../components/Modal'
import BannerForm from '../components/BannerForm'
import PageLoadingSpinner from '../components/PageLoadingSpinner'

import FilterDropdown from '../components/FilterDropdown'
import PaginationSelector from '../components/PaginationSelector'
import type { Banner, BannerInsert } from '../types'

// Theme imports
import {
  getPageLayoutClasses,
  getButtonClasses,
  getStatsCardProps,
  getStatusBadge,
  getIconClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'
import { formatDateDisplay } from '../utils/format'
import { INPUT_VARIANTS, FILTER_OPTIONS } from '../constants/components'

const Banners: React.FC = () => {
  const { banners, loading, createBanner, updateBanner, deleteBanner } = useBanners()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof Banner | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Theme classes
  const layout = getPageLayoutClasses()

  // Enhanced filtering and sorting
  const filteredAndSortedBanners = useMemo(() => {
    const filtered = banners.filter((banner) => {
      const matchesSearch = banner.target_url
        ? banner.target_url.toLowerCase().includes(searchTerm.toLowerCase())
        : searchTerm === ''

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && banner.is_active) ||
        (filterStatus === 'inactive' && !banner.is_active)

      return matchesSearch && matchesStatus
    })

    // Sort banners
    filtered.sort((a, b) => {
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

    return filtered
  }, [banners, searchTerm, filterStatus, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBanners.length / itemsPerPage)
  const paginatedBanners = filteredAndSortedBanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      await deleteBanner(id)
      // Reset to first page if current page becomes empty
      if (paginatedBanners.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
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
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, data)
      } else {
        await createBanner(data)
        // Go to first page to see the new banner
        setCurrentPage(1)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save banner:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Use predefined filter options from constants
  const statusOptions = [...FILTER_OPTIONS.bannerStatus]

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
      header: 'Banner Details',
      accessor: 'target_url' as keyof Banner,
      sortable: true,
      render: (value: unknown, row: Banner) => {
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={getIconClasses('table')}>
                <Image className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>
                {(value as string | null) || 'No target URL'}
              </div>
              <div className={cn(getTypographyClasses('small'), 'truncate')}>ID: {row.id.slice(0, 8)}...</div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={getStatusBadge(row.is_active ? 'active' : 'inactive')}>
                  {row.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Target URL',
      accessor: 'id' as keyof Banner,
      render: (value: unknown, row: Banner) => {
        return (
          <div className={getTypographyClasses('small')}>
            {row.target_url ? (
              <div className="flex items-center text-blue-600 hover:text-blue-800">
                <Link className="w-4 h-4 mr-1" />
                <a
                  href={row.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline truncate max-w-xs"
                >
                  {row.target_url}
                </a>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <Link className="w-4 h-4 mr-1" />
                <span>No URL set</span>
              </div>
            )}
          </div>
        )
      }
    },
    {
      header: 'Created Date',
      accessor: 'created_at' as keyof Banner,
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
      accessor: 'id' as keyof Banner,
      render: (value: unknown, row: Banner) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleToggleStatus(row)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title={row.is_active ? 'Deactivate banner' : 'Activate banner'}
          >
            {row.is_active ? (
              <ToggleLeft className={getIconClasses('action')} />
            ) : (
              <ToggleRight className={getIconClasses('action')} />
            )}
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit banner"
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleDelete(value as string)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete banner"
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  // Stats calculations
  const activeBanners = banners.filter((b) => b.is_active).length
  const inactiveBanners = banners.filter((b) => !b.is_active).length
  const activeRate = banners.length > 0 ? (activeBanners / banners.length) * 100 : 0

  const totalBannersProps = getStatsCardProps('banners')
  const activeProps = getStatsCardProps('banners')
  const inactiveProps = getStatsCardProps('banners')
  const rateProps = getStatsCardProps('banners')

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message="Loading banners..." />
      </div>
    )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedBanners.length)

  return (
    <div className={layout.container}>
      <div className="space-y-6">
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>Banners Management</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              Create and manage your promotional banners
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className={getButtonClasses('primary', 'md')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Banner
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={layout.grid}>
          <div className={totalBannersProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'banners')}>
                <Image className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={totalBannersProps.valueClasses}>{banners.length}</div>
                <div className={totalBannersProps.labelClasses}>Total Banners</div>
              </div>
            </div>
          </div>

          <div className={activeProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'posts')}>
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={activeProps.valueClasses}>{activeBanners}</div>
                <div className={activeProps.labelClasses}>Active</div>
              </div>
            </div>
          </div>

          <div className={inactiveProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'users')}>
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={inactiveProps.valueClasses}>{inactiveBanners}</div>
                <div className={inactiveProps.labelClasses}>Inactive</div>
              </div>
            </div>
          </div>

          <div className={rateProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'products')}>
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={rateProps.valueClasses}>{activeRate.toFixed(0)}%</div>
                <div className={rateProps.labelClasses}>Active Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Banners Content */}
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
                    placeholder="Search banners by URL..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(INPUT_VARIANTS.withIcon, 'py-2')}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FilterDropdown
                  options={statusOptions}
                  value={filterStatus}
                  onChange={(value) => {
                    setFilterStatus(value)
                    setCurrentPage(1)
                  }}
                  label="Status"
                />
                <PaginationSelector
                  value={itemsPerPage}
                  onChange={(value) => {
                    setItemsPerPage(value)
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                  totalItems={filteredAndSortedBanners.length}
                />
                <div className={cn('flex items-center space-x-2', getTypographyClasses('small'))}>
                  <Calendar className="w-4 h-4" />
                  <span>
                    Showing {startItem}-{endItem} of {filteredAndSortedBanners.length} banners
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Table with padding */}
          <div className="px-6 pb-6">
            <Table
              data={paginatedBanners}
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
                    <span className="font-medium">{filteredAndSortedBanners.length}</span> results
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
          title={editingBanner ? 'Edit Banner' : 'Create New Banner'}
        >
          <BannerForm
            banner={editingBanner}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        </Modal>
      </div>
    </div>
  )
}

export default Banners
