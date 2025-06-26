import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Calendar,
  MapPin,
  FileText
} from 'lucide-react'
import { useBrokers } from '../hooks/useBrokers'
import { useTranslation } from '../hooks/useTranslation'
import Table from '../components/Table'
import Modal from '../components/Modal'
import BrokerForm from '../components/BrokerForm'
import ConfirmDialog from '../components/ConfirmDialog'
import PageLoadingSpinner from '../components/PageLoadingSpinner'
import RecordImage from '../components/RecordImage'
import { stripHtmlAndTruncate } from '../utils'

import PaginationSelector from '../components/PaginationSelector'
import type { Broker, BrokerInsert } from '../types'

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
import { INPUT_VARIANTS } from '../constants/components'

const Brokers: React.FC = () => {
  const { brokers, loading, createBroker, updateBroker, deleteBroker, isDeleting } = useBrokers()
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof Broker | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    brokerId: number | null;
    brokerName: string | null;
  }>({
    isOpen: false,
    brokerId: null,
    brokerName: null
  })

  // Theme classes
  const layout = getPageLayoutClasses()

  // Enhanced filtering and sorting
  const filteredAndSortedBrokers = useMemo(() => {
    const filtered = brokers.filter((broker) => {
      const matchesSearch =
        (broker.headquarter && broker.headquarter.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.description && broker.description.toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesSearch
    })

    // Sort brokers
    filtered.sort((a, b) => {
      if (!sortColumn) return 0

      let aValue: string | number
      let bValue: string | number

      switch (sortColumn) {
      case 'headquarter':
        aValue = (a.headquarter || '').toLowerCase()
        bValue = (b.headquarter || '').toLowerCase()
        break
      case 'established_at':
        aValue = a.established_at ? new Date(a.established_at).getTime() : 0
        bValue = b.established_at ? new Date(b.established_at).getTime() : 0
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
  }, [brokers, searchTerm, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBrokers.length / itemsPerPage)
  const paginatedBrokers = filteredAndSortedBrokers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleEdit = (broker: Broker) => {
    setEditingBroker(broker)
    setIsModalOpen(true)
  }

  const handleDelete = (broker: Broker) => {
    setConfirmDialog({
      isOpen: true,
      brokerId: broker.id,
      brokerName: broker.headquarter
    })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDialog.brokerId) return

    try {
      await deleteBroker(confirmDialog.brokerId)
      // Reset to first page if current page becomes empty
      if (paginatedBrokers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    } finally {
      setConfirmDialog({
        isOpen: false,
        brokerId: null,
        brokerName: null
      })
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialog({
      isOpen: false,
      brokerId: null,
      brokerName: null
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBroker(null)
  }

  const handleSubmit = async (data: BrokerInsert) => {
    try {
      if (editingBroker) {
        await updateBroker(editingBroker.id, data)
      } else {
        await createBroker(data)
        // Go to first page to see the new broker
        setCurrentPage(1)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save broker:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSort = (column: keyof Broker) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const columns = [
    {
      header: t('brokers.brokerInformation'),
      accessor: 'headquarter' as keyof Broker,
      sortable: true,
      render: (value: unknown, row: Broker) => {
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <RecordImage
                tableName="brokers"
                recordId={row.id.toString()}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                fallbackClassName="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center"
                alt={`${value as string || 'Broker'} logo`}
                fallbackIcon={<Building2 className="w-4 h-4 text-white" />}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>
                {value as string || t('brokers.noHeadquarterInfo')}
              </div>
              <div className={cn(getTypographyClasses('small'), 'text-gray-600')}>
                {row.description ? stripHtmlAndTruncate(row.description, 80) : t('brokers.noDescription')}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: t('brokers.established'),
      accessor: 'established_at' as keyof Broker,
      sortable: true,
      render: (value: unknown) => {
        return (
          <div className={cn(getTypographyClasses('small'), 'text-gray-900')}>
            {value ? (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                <span>{formatDateDisplay(value as string)}</span>
              </div>
            ) : (
              <span className="text-gray-400">{t('brokers.notSpecified')}</span>
            )}
          </div>
        )
      }
    },
    {
      header: t('brokers.createdDate'),
      accessor: 'created_at' as keyof Broker,
      sortable: true,
      render: (value: unknown) => {
        return (
          <div className={cn(getTypographyClasses('small'), 'text-gray-900')}>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1 text-gray-400" />
              <span>{formatDateDisplay(value as string)}</span>
            </div>
          </div>
        )
      }
    },
    {
      header: t('brokers.actions'),
      accessor: 'id' as keyof Broker,
      render: (value: unknown, row: Broker) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
            title={t('brokers.tooltips.editBroker')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title={t('brokers.tooltips.deleteBroker')}
          >
            <Trash2 className={getIconClasses('action')} />
          </button>
        </div>
      )
    }
  ]

  // Stats calculations
  const totalBrokers = brokers.length
  const brokersWithHQ = brokers.filter((b) => b.headquarter).length
  const brokersWithEstDate = brokers.filter((b) => b.established_at).length
  const recentBrokers = brokers.filter(
    (b) => new Date(b.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length

  const totalBrokersProps = getStatsCardProps('products')
  const hqProps = getStatsCardProps('users')
  const estDateProps = getStatsCardProps('posts')
  const recentProps = getStatsCardProps('banners')

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('brokers.loadingBrokers')} />
      </div>
    )
  }

  return (
    <div className={layout.container}>
      <div className="space-y-6">
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('brokers.title')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('brokers.description')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className={getButtonClasses('primary', 'md')}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('brokers.addBroker')}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={layout.grid}>
          <div className={totalBrokersProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'products')}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={totalBrokersProps.valueClasses}>{totalBrokers}</div>
                <div className={totalBrokersProps.labelClasses}>{t('brokers.totalBrokers')}</div>
              </div>
            </div>
          </div>

          <div className={hqProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'users')}>
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={hqProps.valueClasses}>{brokersWithHQ}</div>
                <div className={hqProps.labelClasses}>{t('brokers.withHeadquarters')}</div>
              </div>
            </div>
          </div>

          <div className={estDateProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'posts')}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={estDateProps.valueClasses}>{brokersWithEstDate}</div>
                <div className={estDateProps.labelClasses}>{t('brokers.withEstDate')}</div>
              </div>
            </div>
          </div>

          <div className={recentProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'banners')}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={recentProps.valueClasses}>{recentBrokers}</div>
                <div className={recentProps.labelClasses}>{t('brokers.recent30d')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Brokers Content */}
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
                    placeholder={t('brokers.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(INPUT_VARIANTS.withIcon, 'py-2')}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <PaginationSelector
                  value={itemsPerPage}
                  onChange={(value) => {
                    setItemsPerPage(value)
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                  totalItems={filteredAndSortedBrokers.length}
                />

              </div>
            </div>
          </div>

          {/* Table with padding */}
          <div className="px-6 pb-6">
            <Table
              data={paginatedBrokers}
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
                  {t('brokers.previous')}
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(getButtonClasses('secondary', 'md'), 'ml-3')}
                >
                  {t('brokers.next')}
                </button>
              </div>

              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div></div>

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
          title={editingBroker ? t('brokers.editBroker') : t('brokers.addNewBroker')}
        >
          <BrokerForm
            broker={editingBroker}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={t('brokers.deleteBrokerTitle')}
          message={t('brokers.deleteBrokerMessage', {
            brokerName: confirmDialog.brokerName || t('thisBroker')
          })}
          confirmLabel={t('delete')}
          cancelLabel={t('cancel')}
          isDestructive={true}
          isLoading={isDeleting}
          variant="danger"
        />
      </div>
    </div>
  )
}

export default Brokers
