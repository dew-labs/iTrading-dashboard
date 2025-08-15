// 🎯 Affiliates Management Page
// Admin-only page for managing affiliate users and their referrals

import React, { useState, useMemo } from 'react'
import { Search, Users } from 'lucide-react'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import { useAffiliates, useAffiliateStats } from '../features/affiliates/api/hooks'
import { useAffiliatesFiltering } from '../hooks/useAffiliatesFiltering'
import {
  AffiliatesStats,
  AffiliatesTable,
  AffiliateDetailsModal
} from '../features/affiliates/components'
import { FilterDropdown, PaginationSelector } from '../components/molecules'
import { Input } from '../components/atoms'
import { PageLoadingSpinner } from '../components/feedback'
import { useQuery } from '@tanstack/react-query'
import { groupImagesByRecord } from '../utils'
import { supabase } from '../lib/supabase'
import type { AffiliateWithMetrics, Image } from '../types'

// Theme imports
import {
  getPageLayoutClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'

const Affiliates: React.FC = () => {
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms

  // API hooks
  const { data: affiliates = [], isLoading: affiliatesLoading, error: affiliatesError } = useAffiliates()
  const { data: stats, isLoading: statsLoading } = useAffiliateStats()

  // Filtering and pagination
  const {
    filterState,
    paginatedAffiliates,
    totalPages,
    totalCount,
    filterOptions,
    setSearchTerm,
    setStatusFilter,
    setItemsPerPage,
    setPageInputValue: _setPageInputValue,
    handleSort,
    handlePageChange: _handlePageChange
  } = useAffiliatesFiltering({ affiliates })

  // Modal state
  const [viewingAffiliate, setViewingAffiliate] = useState<AffiliateWithMetrics | null>(null)

  // Theme classes
  const layout = getPageLayoutClasses()

  // Fetch images for affiliates
  const { data: images = [] } = useQuery({
    queryKey: ['images', 'users', ...affiliates.map(a => a.id)],
    queryFn: async () => {
      if (affiliates.length === 0) return []

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('table_name', 'users')
        .in('record_id', affiliates.map(a => a.id))

      if (error) {
        console.error('Error fetching affiliate images:', error)
        return []
      }

      return data as Image[]
    },
    enabled: affiliates.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const imagesByRecord = useMemo(() => groupImagesByRecord(images)['users'] || {}, [images])

  // Event handlers
  const handleViewDetails = (affiliate: AffiliateWithMetrics) => {
    setViewingAffiliate(affiliate)
  }

  const handleCloseModal = () => {
    setViewingAffiliate(null)
  }



  // Loading state
  if (affiliatesLoading && affiliates.length === 0) {
    return (
      <PageLoadingSpinner message={t('affiliates.loading.fetchingAffiliates')} />
    )
  }

  // Error state
  if (affiliatesError) {
    return (
      <div className={layout.container}>
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={cn(getTypographyClasses('h2'), 'mb-2')}>
            {t('affiliates.errors.loadingFailed')}
          </h2>
          <p className={getTypographyClasses('description')}>
            {affiliatesError.message || t('affiliates.errors.genericError')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={layout.container}>
      <div className='space-y-6'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('affiliates.title')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('affiliates.subtitle')}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <AffiliatesStats stats={stats || {
        total_affiliates: 0,
        active_affiliates: 0,
        total_referrals: 0,
        total_active_codes: 0,
        top_performer: null
        }} loading={statsLoading} />

        {/* Affiliates Content */}
        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='p-6 space-y-4'>
            {/* Search and filters row */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4'>
              <div className='flex-1 max-w-md'>
                <Input
                  type='text'
                  placeholder={tCommon('placeholders.searchAffiliatesPlaceholder')}
                  value={filterState.searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  leftIcon={Search}
                  variant='default'
                  className='transition-all duration-200 w-full max-w-full focus:w-[32rem] focus:shadow-lg'
                />
              </div>

              <div className='flex items-center space-x-3'>
                <FilterDropdown
                  label={t('affiliates.filters.status')}
                  value={filterState.statusFilter}
                  options={filterOptions.statusOptions}
                  onChange={setStatusFilter}
                />

                {/* <FilterDropdown
                  label={t('affiliates.filters.performance')}
                  value={filterState.performanceFilter}
                  options={filterOptions.performanceOptions}
                  onChange={setPerformanceFilter}
                /> */}
              </div>
            </div>

            {/* Affiliates Table */}
            {paginatedAffiliates.length > 0 ? (
              <AffiliatesTable
                affiliates={paginatedAffiliates}
                imagesByRecord={imagesByRecord}
                onViewDetails={handleViewDetails}
                onSort={handleSort}
                sortColumn={filterState.sortColumn}
                sortDirection={filterState.sortDirection}
              />
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>
                  {filterState.searchTerm || filterState.statusFilter !== 'all'
                    ? t('affiliates.empty.noResults')
                    : t('affiliates.empty.noAffiliates')
                  }
                </h3>
                <p className={getTypographyClasses('description')}>
                  {filterState.searchTerm || filterState.statusFilter !== 'all'
                    ? t('affiliates.empty.tryDifferentFilters')
                    : t('affiliates.empty.noAffiliatesDescription')
                  }
                </p>

              </div>
            )}

            {/* Pagination */}
            <div className='flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-3'>
              <div className='flex items-center space-x-6'>
                <PaginationSelector
                  value={filterState.pageSize}
                  onChange={value => {
                    setItemsPerPage(value)
                    _handlePageChange(1) // Reset to first page when changing items per page
                  }}
                />
                <div className='flex items-center'>
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    {tCommon('pagination.showingRows', {
                      startItem: (filterState.currentPage - 1) * filterState.pageSize + 1,
                      endItem: Math.min(
                        filterState.currentPage * filterState.pageSize,
                        totalCount
                      ),
                      total: totalCount
                    })}
                  </span>
                </div>
              </div>

              {totalPages > 1 && (
                <div className='flex items-center space-x-2'>
                  <button
                    onClick={() => _handlePageChange(filterState.currentPage - 1)}
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
                        _setPageInputValue(e.target.value)
                      }}
                      onBlur={e => {
                        const page = parseInt(e.target.value)
                        if (!isNaN(page) && page >= 1 && page <= totalPages) {
                          _handlePageChange(page)
                        } else {
                          _setPageInputValue(filterState.currentPage.toString())
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const page = parseInt(filterState.pageInputValue)
                          if (!isNaN(page) && page >= 1 && page <= totalPages) {
                            _handlePageChange(page)
                          } else {
                            _setPageInputValue(filterState.currentPage.toString())
                          }
                        }
                      }}
                      className='w-12 px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-2 dark:focus:ring-white dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      {tCommon('pagination.of')} {totalPages}
                    </span>
                  </div>
                  <button
                    onClick={() => _handlePageChange(filterState.currentPage + 1)}
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

        {/* Affiliate Details Modal */}
        <AffiliateDetailsModal
          affiliate={viewingAffiliate}
          isOpen={!!viewingAffiliate}
          onClose={handleCloseModal}
          imagesByRecord={imagesByRecord}
        />
      </div>
    </div>
  )
}

export default Affiliates
