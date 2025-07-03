import React, { useState } from 'react'
import { Download, Trash2, Search, X } from 'lucide-react'
import { useAuditLogs } from '../hooks/useAuditLogs'
import { useAuditFiltering } from '../hooks/useAuditFiltering'
import { usePermissions } from '../hooks/usePermissions'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'

import { AuditLogTable, AuditLogDetails } from '../components/features/audits'
import { FilterDropdown, PaginationSelector, Input, Button, Modal } from '../components'
import { ConfirmDialog } from '../components/common'
import { PageLoadingSpinner } from '../components/feedback'
import { AUDIT_TABLES } from '../types/audits'
import type { AuditLog } from '../types'

// Theme imports
import {
  getPageLayoutClasses,
  getTypographyClasses
} from '../utils/theme'

const Audits: React.FC = () => {
  const { auditLogs, loading, deleteAuditLog, deleteOldAuditLogs, canDelete } = useAuditLogs()
  const { isAdmin } = usePermissions()
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation()

  // Use the filtering hook for all business logic
  const {
    filteredAuditLogs,
    paginatedAuditLogs,
    totalPages,
    setSearchTerm,
    setSelectedTable,
    setSelectedAction,

    setItemsPerPage,
    setPageInputValue,
    handlePageChange,
    clearFilters,
    activeFiltersCount,
    filterState
  } = useAuditFiltering(auditLogs)

  // State management
  const [viewingLog, setViewingLog] = useState<AuditLog | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    log: AuditLog | null
    isDeleting: boolean
  }>({
    isOpen: false,
    log: null,
    isDeleting: false
  })
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState<{
    isOpen: boolean
    isDeleting: boolean
  }>({
    isOpen: false,
    isDeleting: false
  })

  // Theme classes
  const layout = getPageLayoutClasses()

  const handleView = (log: AuditLog) => {
    setViewingLog(log)
  }

  const handleDelete = (log: AuditLog) => {
    if (!canDelete) {
      alert(t('audits.permissionRequired'))
      return
    }
    setDeleteConfirm({ isOpen: true, log, isDeleting: false })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.log) return

    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }))

    try {
      await deleteAuditLog(deleteConfirm.log.id)
      setDeleteConfirm({ isOpen: false, log: null, isDeleting: false })
      // Reset to first page if current page becomes empty
      if (paginatedAuditLogs.length === 1 && filterState.currentPage > 1) {
        handlePageChange(filterState.currentPage - 1)
      }
    } catch (error) {
      console.error('Failed to delete audit log:', error)
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleBulkDelete = () => {
    if (!canDelete) {
      alert(t('audits.permissionRequired'))
      return
    }
    setBulkDeleteConfirm({ isOpen: true, isDeleting: false })
  }

  const confirmBulkDelete = async () => {
    setBulkDeleteConfirm(prev => ({ ...prev, isDeleting: true }))

    try {
      await deleteOldAuditLogs(30) // Delete logs older than 30 days
      setBulkDeleteConfirm({ isOpen: false, isDeleting: false })
      handlePageChange(1) // Go to first page after bulk delete
    } catch (error) {
      console.error('Failed to bulk delete audit logs:', error)
      setBulkDeleteConfirm(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleExport = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const filename = `recent-activities-${today}.csv`

      // Simple CSV export with human-readable headers
      const csvContent = [
        `${t('audits.export.headers.dateTime')},${t('audits.export.headers.user')},${t('audits.export.headers.role')},${t('audits.export.headers.action')},${t('audits.export.headers.target')},${t('audits.export.headers.description')}`,
        ...filteredAuditLogs.map(log => {
          const date = new Date(log.created_at || '').toLocaleString()
          const user = log.user_email || t('audits.export.unknownUser')
          const role = (log.user_role || t('audits.export.unknownRole')).replace('_', ' ').toUpperCase()
          const action = log.action.toLowerCase()
          const target = log.table_name.replace('_', ' ').toUpperCase()
          const description = t('audits.export.recordDescription', {
            action,
            target: target.toLowerCase(),
            id: log.record_id
          })

          return `"${date}","${user}","${role}","${action}","${target}","${description}"`
        })
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export audit logs:', error)
    }
  }

  // Filter options
  const tableOptions = [
    { value: 'all', label: tCommon('general.all') },
    ...Object.entries(AUDIT_TABLES).map(([key, config]) => ({
      value: key,
      label: config.name
    }))
  ]

  const actionOptions = [
    { value: 'all', label: tCommon('general.all') },
    { value: 'INSERT', label: tCommon('actions.create') },
    { value: 'UPDATE', label: tCommon('actions.update') },
    { value: 'DELETE', label: tCommon('actions.delete') }
  ]

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('audits.loadingActivities')} />
      </div>
    )
  }

  return (
    <div className={layout.container}>
      <div className='space-y-6'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('audits.title')}</h1>
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              {t('audits.description')}
            </p>
          </div>
          <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
            <Button
              variant='secondary'
              size='md'
              leftIcon={Download}
              onClick={handleExport}
              disabled={filteredAuditLogs.length === 0}
            >
              {t('audits.exportData')}
            </Button>
            {isAdmin() && (
              <Button
                variant='danger'
                size='md'
                leftIcon={Trash2}
                onClick={handleBulkDelete}
                disabled={auditLogs.length === 0}
              >
                {t('audits.cleanOldLogs')}
              </Button>
            )}
          </div>
        </div>

                {/* Recent Activities Table */}
        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='p-6 space-y-4'>
            {/* Search and filters row */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4'>
              <div className='flex-1 max-w-md'>
                <Input
                  type='text'
                  placeholder={tCommon('placeholders.searchActivitiesPlaceholder')}
                  value={filterState.searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  leftIcon={Search}
                  variant='search'
                />
              </div>

              <div className='flex items-center space-x-3'>
                <FilterDropdown
                  options={tableOptions}
                  value={filterState.selectedTable}
                  onChange={value => {
                    setSelectedTable(value)
                    handlePageChange(1)
                  }}
                  label={t('audits.filters.resource')}
                />
                <FilterDropdown
                  options={actionOptions}
                  value={filterState.selectedAction}
                  onChange={value => {
                    setSelectedAction(value)
                    handlePageChange(1)
                  }}
                  label={t('audits.filters.action')}
                />
                {activeFiltersCount > 0 && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      clearFilters()
                      handlePageChange(1)
                    }}
                    leftIcon={X}
                    className="hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                  >
                    {t('audits.clearFilters')}
                  </Button>
                )}
              </div>
            </div>

            {/* Table */}
            <AuditLogTable
              auditLogs={paginatedAuditLogs}
              loading={loading}
              totalPages={totalPages}
              currentPage={filterState.currentPage}
              itemsPerPage={filterState.itemsPerPage}
              totalItems={filteredAuditLogs.length}
              onPageChange={handlePageChange}
              onViewDetails={handleView}
              onDeleteLog={(id: number) => {
                const log = auditLogs.find(l => l.id === id)
                if (log) handleDelete(log)
              }}
              canDelete={canDelete}
            />

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-3'>
              <div className='flex items-center space-x-6'>
                <PaginationSelector
                  value={filterState.itemsPerPage}
                  onChange={value => {
                    setItemsPerPage(value)
                    handlePageChange(1)
                  }}
                />
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {tCommon('pagination.showingRows', {
                      startItem: (filterState.currentPage - 1) * filterState.itemsPerPage + 1,
                      endItem: Math.min(filterState.currentPage * filterState.itemsPerPage, filteredAuditLogs.length),
                      total: filteredAuditLogs.length
                    })}
                  </span>
                </div>
              </div>

              {totalPages > 1 && (
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => handlePageChange(filterState.currentPage - 1)}
                    disabled={filterState.currentPage === 1}
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
                      value={filterState.pageInputValue}
                      onChange={e => setPageInputValue(e.target.value)}
                      onBlur={e => {
                        const page = parseInt(e.target.value)
                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                          handlePageChange(page)
                        } else {
                          setPageInputValue(filterState.currentPage.toString())
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const page = parseInt(filterState.pageInputValue)
                          if (!isNaN(page) && page >= 1 && page <= totalPages) {
                            handlePageChange(page)
                          } else {
                            setPageInputValue(filterState.currentPage.toString())
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
                    onClick={() => handlePageChange(filterState.currentPage + 1)}
                    disabled={filterState.currentPage === totalPages}
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

        {/* Modals */}
        {viewingLog && (
          <Modal
            isOpen={true}
            onClose={() => setViewingLog(null)}
            title={t('audits.activityDetails')}
            size='lg'
          >
            <AuditLogDetails
              auditLog={viewingLog}
              onClose={() => setViewingLog(null)}
            />
          </Modal>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirm.isOpen}
          onClose={() => setDeleteConfirm({ isOpen: false, log: null, isDeleting: false })}
          onConfirm={confirmDelete}
          title={t('audits.deleteLogTitle')}
          message={t('audits.deleteLogMessage')}
          confirmLabel={tCommon('actions.delete')}
          cancelLabel={tCommon('actions.cancel')}
          isDestructive={true}
          isLoading={deleteConfirm.isDeleting}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={bulkDeleteConfirm.isOpen}
          onClose={() => setBulkDeleteConfirm({ isOpen: false, isDeleting: false })}
          onConfirm={confirmBulkDelete}
          title={t('audits.bulkDeleteTitle')}
          message={t('audits.bulkDeleteMessage')}
          confirmLabel={tCommon('actions.delete')}
          cancelLabel={tCommon('actions.cancel')}
          isDestructive={true}
          isLoading={bulkDeleteConfirm.isDeleting}
        />
      </div>
    </div>
  )
}

export default Audits
