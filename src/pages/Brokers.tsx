import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Building2,
  Calendar,
  MapPin,
  FileText,
  Grid3X3,
  List
} from 'lucide-react'
import Button from '../components/Button'
import Input from '../components/Input'
import { useBrokers } from '../hooks/useBrokers'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import Table from '../components/Table'
import Modal from '../components/Modal'
import BrokerForm from '../components/BrokerForm'
import BrokerViewModal from '../components/BrokerViewModal'
import ConfirmDialog from '../components/ConfirmDialog'
import PageLoadingSpinner from '../components/PageLoadingSpinner'
import { stripHtmlAndTruncate } from '../utils'

import PaginationSelector from '../components/PaginationSelector'
import type { Broker, BrokerInsert } from '../types'

// Theme imports
import {
  getPageLayoutClasses,
  getStatsCardProps,
  getIconClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'
import { formatDateDisplay } from '../utils/format'

// BrokerCard component for card view
interface BrokerCardProps {
  broker: Broker
  onView: (broker: Broker) => void
  onEdit: (broker: Broker) => void
  onDelete: (broker: Broker) => void
}

const BrokerCard: React.FC<BrokerCardProps> = ({ broker, onView, onEdit, onDelete }) => {
  const { t } = usePageTranslation()
  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden'>
      {/* Header with logo and actions */}
      <div className='p-6 pb-4'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              {broker.logo_url ? (
                <img
                  src={broker.logo_url}
                  alt={`${broker.headquarter || t('brokers.broker')} logo`}
                  className='w-12 h-12 rounded-lg object-cover border border-gray-200'
                />
              ) : (
                <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center'>
                  <Building2 className='w-6 h-6 text-white' />
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white truncate'>
                {broker.name || broker.headquarter || t('brokers.unknownBroker')}
              </h3>
              {broker.established_in && (
                <div className='flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1'>
                  <Calendar className='w-4 h-4 mr-1' />
                  <span>
                    {t('brokers.est')} {broker.established_in}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className='flex space-x-1'>
            <button
              onClick={() => onView(broker)}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors'
              title={t('brokers.tooltips.viewBroker')}
            >
              <Eye className='w-4 h-4' />
            </button>
            <button
              onClick={() => onEdit(broker)}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors'
              title={t('brokers.tooltips.editBroker')}
            >
              <Edit2 className='w-4 h-4' />
            </button>
            <button
              onClick={() => onDelete(broker)}
              className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors'
              title={t('brokers.tooltips.deleteBroker')}
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* Headquarter info */}
        {broker.headquarter && (
          <div className='flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3'>
            <MapPin className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
            <span>{broker.headquarter}</span>
          </div>
        )}

        {/* Description */}
        <div className='text-sm text-gray-600 dark:text-gray-300 line-clamp-3'>
          {broker.description ? (
            <div
              dangerouslySetInnerHTML={{
                __html:
                  broker.description.length > 150
                    ? broker.description.substring(0, 150) + '...'
                    : broker.description
              }}
            />
          ) : (
            <span className='italic text-gray-400 dark:text-gray-500'>{t('brokers.noDescriptionAvailable')}</span>
          )}
        </div>
      </div>

      {/* Footer with metadata */}
      <div className='px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600'>
        <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
          <div className='flex items-center'>
            <FileText className='w-3 h-3 mr-1' />
            <span>
              {t('brokers.added')} {formatDateDisplay(broker.created_at || new Date().toISOString())}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const Brokers: React.FC = () => {
  const { brokers, loading, createBroker, updateBroker, deleteBroker, isDeleting } = useBrokers()
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null)
  const [viewingBroker, setViewingBroker] = useState<Broker | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list')
  const [sortColumn, setSortColumn] = useState<keyof Broker | null>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [pageInputValue, setPageInputValue] = useState('1')

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    brokerId: number | null
    brokerName: string | null
  }>({
    isOpen: false,
    brokerId: null,
    brokerName: null
  })

  // Theme classes
  const layout = getPageLayoutClasses()

  // Enhanced filtering and sorting
  const filteredAndSortedBrokers = useMemo(() => {
    const filtered = brokers.filter(broker => {
      const matchesSearch =
        (broker.headquarter &&
          broker.headquarter.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (broker.description && broker.description.toLowerCase().includes(searchTerm.toLowerCase()))

      return matchesSearch
    })

    // Sort brokers
    filtered.sort((a, b) => {
      if (!sortColumn) return 0

      let aValue: string | number
      let bValue: string | number

      switch (sortColumn) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'headquarter':
        aValue = (a.headquarter || '').toLowerCase()
        bValue = (b.headquarter || '').toLowerCase()
        break
      case 'established_in':
        aValue = a.established_in || 0
        bValue = b.established_in || 0
        break
      case 'created_at':
        aValue = new Date(a.created_at || 0).getTime()
        bValue = new Date(b.created_at || 0).getTime()
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

  const handleView = (broker: Broker) => {
    setViewingBroker(broker)
  }

  const handleEdit = (broker: Broker) => {
    setEditingBroker(broker)
    setIsModalOpen(true)
  }

  const handleDelete = (broker: Broker) => {
    setConfirmDialog({
      isOpen: true,
      brokerId: broker.id,
      brokerName: broker.name
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
    setPageInputValue(page.toString())
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
      accessor: 'name' as keyof Broker,
      sortable: true,
      render: (value: unknown, row: Broker) => {
        return (
          <div className='flex items-center space-x-3'>
            <div className='flex-shrink-0'>
              {row.logo_url ? (
                <img
                  src={row.logo_url}
                  alt={`${row.name} logo`}
                  className='w-12 h-12 rounded-lg object-cover border border-gray-200'
                />
              ) : (
                <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center'>
                  <Building2 className='w-4 h-4 text-white' />
                </div>
              )}
            </div>
            <div className='flex-1 min-w-0'>
              <div className={cn(getTypographyClasses('h4'), 'truncate')}>{row.name}</div>
              <div className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300 truncate')}>
                {row.headquarter || t('brokers.noHeadquarterInfo')}
              </div>
              <div className={cn(getTypographyClasses('small'), 'text-gray-500 dark:text-gray-400 truncate')}>
                {row.description
                  ? stripHtmlAndTruncate(row.description, 60)
                  : t('brokers.noDescription')}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: t('brokers.established'),
      accessor: 'established_in' as keyof Broker,
      sortable: true,
      render: (value: unknown) => {
        return (
          <div className={cn(getTypographyClasses('small'), 'text-gray-900 dark:text-gray-100')}>
            {value ? (
              <div className='flex items-center'>
                <Calendar className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
                <span>{value as number}</span>
              </div>
            ) : (
              <span className='text-gray-400 dark:text-gray-500'>{t('brokers.notSpecified')}</span>
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
          <div className={cn(getTypographyClasses('small'), 'text-gray-900 dark:text-gray-100')}>
            <div className='flex items-center'>
              <FileText className='w-4 h-4 mr-1 text-gray-400 dark:text-gray-500' />
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
        <div className='flex space-x-1'>
          <button
            onClick={() => handleView(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
            title={t('brokers.tooltips.viewBroker')}
          >
            <Eye className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors'
            title={t('brokers.tooltips.editBroker')}
          >
            <Edit2 className={getIconClasses('action')} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className='p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors'
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
  const brokersWithHQ = brokers.filter(b => b.headquarter).length
  const brokersWithEstDate = brokers.filter(b => b.established_in).length
  const recentBrokers = brokers.filter(
    b => new Date(b.created_at || 0) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
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
      <div className='space-y-6'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('brokers.title')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('brokers.description')}
            </p>
          </div>
          <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
            <Button
              variant='primary'
              size='md'
              leftIcon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              {t('brokers.addBroker')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={layout.grid}>
          <div className={totalBrokersProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'products')}>
                <Building2 className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={totalBrokersProps.valueClasses}>{totalBrokers}</div>
                <div className={totalBrokersProps.labelClasses}>{t('brokers.totalBrokers')}</div>
              </div>
            </div>
          </div>

          <div className={hqProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'users')}>
                <MapPin className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={hqProps.valueClasses}>{brokersWithHQ}</div>
                <div className={hqProps.labelClasses}>{t('brokers.withHeadquarters')}</div>
              </div>
            </div>
          </div>

          <div className={estDateProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'posts')}>
                <Calendar className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={estDateProps.valueClasses}>{brokersWithEstDate}</div>
                <div className={estDateProps.labelClasses}>{t('brokers.withEstDate')}</div>
              </div>
            </div>
          </div>

          <div className={recentProps.cardClasses}>
            <div className='flex items-center'>
              <div className={getIconClasses('stats', 'banners')}>
                <FileText className='w-6 h-6 text-white' />
              </div>
              <div className='ml-4'>
                <div className={recentProps.valueClasses}>{recentBrokers}</div>
                <div className={recentProps.labelClasses}>{t('brokers.recent30d')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Brokers Content */}
        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='p-6 space-y-4'>
            {/* Search and filters row */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4'>
              <div className='flex-1 max-w-md'>
                <Input
                  type='text'
                  placeholder={tCommon('placeholders.searchBrokersPlaceholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  leftIcon={Search}
                  variant='search'
                />
              </div>

              <div className='flex items-center space-x-3'>
                {/* View Toggle */}
                <div className='flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    title={t('brokers.listView')}
                  >
                    <List className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'card'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                    title={t('brokers.cardView')}
                  >
                    <Grid3X3 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>

            {/* Content - Table or Cards */}
            {viewMode === 'list' ? (
              <Table
                data={paginatedBrokers}
                columns={columns}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            ) : (
              <>
                {paginatedBrokers.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {paginatedBrokers.map(broker => (
                      <BrokerCard
                        key={broker.id}
                        broker={broker}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12'>
                    <Building2 className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500' />
                    <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-gray-100'>
                      {t('brokers.noBrokersFound')}
                    </h3>
                    <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                      {t('brokers.getStartedByCreating')}
                    </p>
                    <div className='mt-6'>
                      <Button
                        variant='primary'
                        size='md'
                        leftIcon={Plus}
                        onClick={() => setIsModalOpen(true)}
                      >
                        {t('brokers.addBroker')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-3'>
              <div className='flex items-center space-x-6'>
                <PaginationSelector
                  value={itemsPerPage}
                  onChange={value => {
                    setItemsPerPage(value)
                    setCurrentPage(1) // Reset to first page when changing items per page
                  }}
                />
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {tCommon('pagination.showingRows', {
                      startItem: (currentPage - 1) * itemsPerPage + 1,
                      endItem: Math.min(
                        currentPage * itemsPerPage,
                        filteredAndSortedBrokers.length
                      ),
                      total: filteredAndSortedBrokers.length
                    })}
                  </span>
                </div>
              </div>

              {totalPages > 1 && (
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
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
                      value={pageInputValue}
                      onChange={e => {
                        setPageInputValue(e.target.value)
                      }}
                      onBlur={e => {
                        const page = parseInt(e.target.value)
                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                          handlePageChange(page)
                        } else {
                          setPageInputValue(currentPage.toString())
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const page = parseInt(pageInputValue)
                          if (!isNaN(page) && page >= 1 && page <= totalPages) {
                            handlePageChange(page)
                          } else {
                            setPageInputValue(currentPage.toString())
                          }
                        }
                      }}
                      className='w-12 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      {tCommon('pagination.of')} {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
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
              )}
            </div>
          </div>
        </div>

        {/* Modal for creating/editing brokers */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={
            editingBroker
              ? `${tCommon('actions.edit')} ${tCommon('entities.brokers')}`
              : t('brokers.addNewBroker')
          }
        >
          <BrokerForm broker={editingBroker} onSubmit={handleSubmit} onCancel={handleCloseModal} />
        </Modal>

        {/* Enhanced Modal for viewing broker details */}
        {viewingBroker && (
          <BrokerViewModal
            isOpen={!!viewingBroker}
            onClose={() => setViewingBroker(null)}
            broker={viewingBroker}
            onEdit={() => {
              setViewingBroker(null)
              handleEdit(viewingBroker)
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={t('brokers.deleteBrokerTitle')}
          message={
            <div>
              <p>
                {t('brokers.confirmDeleteMessage')}{' '}
                <strong className='font-semibold text-gray-900 dark:text-gray-100'>
                  {confirmDialog.brokerName || t('brokers.thisBroker')}
                </strong>
                ?
              </p>
              <p className='mt-2 text-gray-600 dark:text-gray-400'>{t('brokers.actionCannotBeUndone')}</p>
            </div>
          }
          confirmLabel={tCommon('actions.delete')}
          cancelLabel={tCommon('actions.cancel')}
          isDestructive={true}
          isLoading={isDeleting}
          variant='danger'
        />
      </div>
    </div>
  )
}

export default Brokers
