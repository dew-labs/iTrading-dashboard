// 🎯 Affiliate Filtering Hook
// Handles filtering, sorting, and pagination logic for affiliates

import { useState, useMemo } from 'react'
import { useTranslation } from './useTranslation'
import { AFFILIATE_FILTERS, type AffiliateWithMetrics } from '../types/affiliates'
import {
  type AffiliatesFilterState,
  type AffiliatesFilterOptions,
  DEFAULT_AFFILIATES_FILTER_STATE
} from '../features/affiliates/api/types'

interface UseAffiliatesFilteringProps {
  affiliates: AffiliateWithMetrics[]
}

interface UseAffiliatesFilteringReturn {
  filterState: AffiliatesFilterState
  paginatedAffiliates: AffiliateWithMetrics[]
  totalPages: number
  totalCount: number
  filterOptions: AffiliatesFilterOptions

  // Filter actions
  setSearchTerm: (term: string) => void
  setStatusFilter: (status: string) => void
  setItemsPerPage: (size: number) => void
  setPageInputValue: (value: string) => void
  handleSort: (column: keyof AffiliateWithMetrics) => void
  handlePageChange: (page: number) => void

}

export const useAffiliatesFiltering = ({
  affiliates
}: UseAffiliatesFilteringProps): UseAffiliatesFilteringReturn => {
  const { t } = useTranslation()
  const [filterState, setFilterState] = useState<AffiliatesFilterState>(DEFAULT_AFFILIATES_FILTER_STATE)

  // Filter options with translations
  const filterOptions: AffiliatesFilterOptions = useMemo(() => ({
    statusOptions: [
      { value: AFFILIATE_FILTERS.ALL, label: t('filters.all') },
      { value: AFFILIATE_FILTERS.ACTIVE, label: t('status.active') },
      { value: AFFILIATE_FILTERS.INACTIVE, label: t('status.inactive') },
    ],

  }), [t])

  // Apply filters and search
  const filteredAffiliates = useMemo(() => {
    let filtered = [...affiliates]

    // Search filter
    if (filterState.searchTerm.trim()) {
      const searchLower = filterState.searchTerm.toLowerCase()
      filtered = filtered.filter(affiliate =>
        affiliate.email.toLowerCase().includes(searchLower) ||
        (affiliate.full_name && affiliate.full_name.toLowerCase().includes(searchLower)) ||
        affiliate.referral_codes.some(code =>
          code.referral_code.toLowerCase().includes(searchLower)
        )
      )
    }

    // Status filter
    if (filterState.statusFilter !== AFFILIATE_FILTERS.ALL) {
      switch (filterState.statusFilter) {
        case AFFILIATE_FILTERS.ACTIVE:
          filtered = filtered.filter(affiliate => affiliate.status === 'active')
          break
        case AFFILIATE_FILTERS.INACTIVE:
          filtered = filtered.filter(affiliate => affiliate.status !== 'active')
          break
      }
    }



    return filtered
  }, [affiliates, filterState.searchTerm, filterState.statusFilter])

  // Apply sorting
  const sortedAffiliates = useMemo(() => {
    if (!filterState.sortColumn) return filteredAffiliates

    const sorted = [...filteredAffiliates].sort((a, b) => {
      const aValue = getNestedValue(a, filterState.sortColumn!)
      const bValue = getNestedValue(b, filterState.sortColumn!)

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filterState.sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return filterState.sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue
      }

      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return filterState.sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }

      // Handle date strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue)
        const bDate = new Date(bValue)
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return filterState.sortDirection === 'asc'
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime()
        }
      }

      return 0
    })

    return sorted
  }, [filteredAffiliates, filterState.sortColumn, filterState.sortDirection])

  // Calculate pagination
  const totalCount = sortedAffiliates.length
  const totalPages = Math.ceil(totalCount / filterState.pageSize)
  const startIndex = (filterState.currentPage - 1) * filterState.pageSize
  const endIndex = startIndex + filterState.pageSize
  const paginatedAffiliates = sortedAffiliates.slice(startIndex, endIndex)

  // Action handlers
  const setSearchTerm = (term: string) => {
    setFilterState(prev => ({
      ...prev,
      searchTerm: term,
      currentPage: 1,
      pageInputValue: '1'
    }))
  }

  const setStatusFilter = (status: string) => {
    setFilterState(prev => ({
      ...prev,
      statusFilter: status,
      currentPage: 1,
      pageInputValue: '1'
    }))
  }



  const setItemsPerPage = (size: number) => {
    setFilterState(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
      pageInputValue: '1'
    }))
  }

  const setPageInputValue = (value: string) => {
    setFilterState(prev => ({ ...prev, pageInputValue: value }))
  }

  const handleSort = (column: keyof AffiliateWithMetrics) => {
    setFilterState(prev => ({
      ...prev,
      sortColumn: column,
      sortDirection: prev.sortColumn === column && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setFilterState(prev => ({
        ...prev,
        currentPage: page,
        pageInputValue: page.toString()
      }))
    }
  }



  return {
    filterState,
    paginatedAffiliates,
    totalPages,
    totalCount,
    filterOptions,
    setSearchTerm,
    setStatusFilter,
    setItemsPerPage,
    setPageInputValue,
    handleSort,
    handlePageChange
  }
}

// Helper function to get nested values from objects
function getNestedValue(obj: AffiliateWithMetrics, path: keyof AffiliateWithMetrics): unknown {
  return obj[path]
}
