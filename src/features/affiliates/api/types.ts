// 🎯 Affiliate API Types
// Feature-specific types for affiliate management

import { AFFILIATE_FILTERS, type AffiliateWithMetrics } from '../../../types/affiliates'

// ===============================================
// FILTER STATE & OPTIONS
// ===============================================

export interface AffiliatesFilterState {
  searchTerm: string
  sortColumn: keyof AffiliateWithMetrics | null
  sortDirection: 'asc' | 'desc'
  statusFilter: string
  pageSize: number
  currentPage: number
  pageInputValue: string
}

export interface AffiliatesFilterOptions {
  statusOptions: Array<{ value: string; label: string }>
}

// ===============================================
// FILTER DEFAULTS
// ===============================================

export const DEFAULT_AFFILIATES_FILTER_STATE: AffiliatesFilterState = {
  searchTerm: '',
  sortColumn: 'created_at',
  sortDirection: 'desc',
  statusFilter: AFFILIATE_FILTERS.ALL,
  pageSize: 10,
  currentPage: 1,
  pageInputValue: '1'
}


