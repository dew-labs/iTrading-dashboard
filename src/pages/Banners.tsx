import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useBanners } from '../hooks/useBanners'
import { useBannersFiltering } from '../hooks/useBannersFiltering'
import { useImages } from '../hooks/useImages'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import { FilterDropdown, BannersTable, BannersStats, Modal, PaginationSelector, Button, Input } from '../components'
import { BannerForm, BannerViewModal } from '../components/features/banners'
import { ConfirmDialog } from '../components/common'
import { PageLoadingSpinner } from '../components/feedback'
import type { Banner, BannerInsert } from '../types'
import { useQuery } from '@tanstack/react-query'
import { groupImagesByRecord } from '../utils'
import { supabase } from '../lib/supabase'

// Theme imports
import {
  getPageLayoutClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'

const Banners: React.FC = () => {
  const { banners, loading, createBanner, updateBanner, deleteBanner, isDeleting } = useBanners()
  const { createImageFromUpload } = useImages()
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms

  // Use the filtering hook for all business logic
  const {
    filterState,
    filteredAndSortedBanners,
    paginatedBanners,
    totalPages,
    setSearchTerm,
    setFilterStatus,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange
  } = useBannersFiltering({ banners })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [viewingBanner, setViewingBanner] = useState<Banner | null>(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    bannerId: string | null
    bannerUrl: string | null
  }>({
    isOpen: false,
    bannerId: null,
    bannerUrl: null
  })

  // Theme classes
  const layout = getPageLayoutClasses()

  const handleView = (banner: Banner) => {
    setViewingBanner(banner)
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setIsModalOpen(true)
  }

  const handleDelete = (banner: Banner) => {
    setConfirmDialog({
      isOpen: true,
      bannerId: banner.id,
      bannerUrl: banner.target_url
    })
  }

  const handleConfirmDelete = async () => {
    if (!confirmDialog.bannerId) return

    try {
      await deleteBanner(confirmDialog.bannerId)
      // Reset to first page if current page becomes empty
      if (paginatedBanners.length === 1 && filterState.currentPage > 1) {
        handlePageChange(filterState.currentPage - 1)
      }
    } finally {
      setConfirmDialog({
        isOpen: false,
        bannerId: null,
        bannerUrl: null
      })
    }
  }

  const handleCancelDelete = () => {
    setConfirmDialog({
      isOpen: false,
      bannerId: null,
      bannerUrl: null
    })
  }

  const handleToggleStatus = async (banner: Banner) => {
    await updateBanner(banner.id, { is_visible: !banner.is_visible })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBanner(null)
  }

  const handleSubmit = async (
    data: BannerInsert,
    imageUploadResult?: {
      url: string
      path: string
      id: string
      file?: File
    }
  ) => {
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, data)
      } else {
        // Create banner first
        const newBanner = await createBanner(data)

        // If there's an image upload result, create the image record
        if (imageUploadResult && newBanner && imageUploadResult.file) {
          await createImageFromUpload(
            'banners',
            newBanner.id,
            imageUploadResult,
            `Banner ${newBanner.id.slice(0, 8)} image`,
            imageUploadResult.file.size,
            imageUploadResult.file.type
          )
        }

        // Go to first page to see the new banner
        handlePageChange(1)
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save banner:', error)
    }
  }

  // Use predefined filter options
  const statusOptions = [
    { value: 'all', label: tCommon('general.all') },
    { value: 'active', label: tCommon('status.active') },
    { value: 'inactive', label: tCommon('status.inactive') }
  ]

  const bannerIds = paginatedBanners.map(banner => String(banner.id))
  const { data: images = [] } = useQuery({
    queryKey: ['images', 'banners', bannerIds],
    queryFn: async () => {
      if (bannerIds.length === 0) return []
      const { data } = await supabase
        .from('images')
        .select('*')
        .eq('table_name', 'banners')
        .in('record_id', bannerIds)
      return data || []
    },
    enabled: bannerIds.length > 0
  })
  const imagesByRecord = groupImagesByRecord(images)['banners'] || {}

  if (loading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('banners.loadingBanners')} />
      </div>
    )
  }

  const viewingBannerImage = viewingBanner ? imagesByRecord[viewingBanner.id]?.[0] : undefined

  return (
    <div className={layout.container}>
      <div className='space-y-6'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('banners.title')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('banners.description')}
            </p>
          </div>
          <div className='mt-4 sm:mt-0 flex items-center space-x-3'>
            <Button
              variant='primary'
              size='md'
              leftIcon={Plus}
              onClick={() => setIsModalOpen(true)}
            >
              {t('banners.createBanner')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <BannersStats banners={banners} />

        {/* Banners Content */}
        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='p-6 space-y-4'>
            {/* Search and filters row */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4'>
              <div className='flex-1 max-w-md'>
                <Input
                  type='text'
                  placeholder={tCommon('placeholders.searchBannersPlaceholder')}
                  value={filterState.searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  leftIcon={Search}
                  variant='default'
                />
              </div>

              <div className='flex items-center space-x-3'>
                <FilterDropdown
                  options={statusOptions}
                  value={filterState.filterStatus}
                  onChange={value => {
                    setFilterStatus(value)
                    handlePageChange(1)
                  }}
                  label={tCommon('general.status')}
                />
              </div>
            </div>

            {/* Table */}
            <BannersTable
              banners={paginatedBanners}
              imagesByRecord={imagesByRecord}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onSort={handleSort}
              sortColumn={filterState.sortColumn}
              sortDirection={filterState.sortDirection}
            />

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-3'>
              <div className='flex items-center space-x-6'>
                <PaginationSelector
                  value={filterState.itemsPerPage}
                  onChange={value => {
                    setItemsPerPage(value)
                    handlePageChange(1) // Reset to first page when changing items per page
                  }}
                />
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {tCommon('pagination.showingRows', {
                      startItem: (filterState.currentPage - 1) * filterState.itemsPerPage + 1,
                      endItem: Math.min(
                        filterState.currentPage * filterState.itemsPerPage,
                        filteredAndSortedBanners.length
                      ),
                      total: filteredAndSortedBanners.length
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
                      onChange={e => {
                        setPageInputValue(e.target.value)
                      }}
                      onBlur={e => {
                        const page = parseInt(e.target.value)
                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                          handlePageChange(page)
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const page = parseInt(filterState.pageInputValue)
                          if (!isNaN(page) && page >= 1 && page <= totalPages) {
                            handlePageChange(page)
                          }
                        }
                      }}
                      className='w-12 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200'
                    />
                    <span className='text-sm text-gray-700'>
                      {tCommon('pagination.of')} {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePageChange(filterState.currentPage + 1)}
                    disabled={filterState.currentPage === totalPages}
                    className='p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'
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

        {/* Modal for creating/editing banners */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={
            editingBanner
              ? t('banners.editBanner')
              : t('banners.createBanner')
          }
          size='xl'
        >
          <BannerForm
            banner={editingBanner}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        </Modal>

        {/* Modal for viewing banner details */}
        {viewingBanner && (
          <BannerViewModal
            isOpen={!!viewingBanner}
            onClose={() => setViewingBanner(null)}
            banner={viewingBanner}
            image={viewingBannerImage || null}
            onEdit={() => {
              setViewingBanner(null)
              handleEdit(viewingBanner)
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={t('banners.deleteBannerTitle')}
          message={t('banners.deleteBannerMessage', {
            bannerUrl: confirmDialog.bannerUrl || t('banners.thisBanner')
          })}
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

export default Banners
