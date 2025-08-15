// 🎯 Affiliate Management Types
// Defines TypeScript interfaces for affiliate-related functionality

import type { Database } from './database'

// ===============================================
// DATABASE TYPES
// ===============================================

export type UserReferralCode = Database['public']['Tables']['user_referral_codes']['Row']
export type UserReferralCodeInsert = Database['public']['Tables']['user_referral_codes']['Insert']
export type UserReferralCodeUpdate = Database['public']['Tables']['user_referral_codes']['Update']

export type UserReferral = Database['public']['Tables']['user_referrals']['Row']
export type UserReferralInsert = Database['public']['Tables']['user_referrals']['Insert']
export type UserReferralUpdate = Database['public']['Tables']['user_referrals']['Update']

// ===============================================
// EXTENDED AFFILIATE TYPES
// ===============================================

/**
 * Affiliate user with extended referral information
 */
export interface AffiliateWithMetrics {
  id: string
  email: string
  full_name: string | null
  role: 'affiliate'
  status: string
  created_at: string
  updated_at: string

  // Referral codes for this affiliate
  referral_codes: UserReferralCode[]

  // Metrics
  metrics: {
    total_referrals: number
    total_active_codes: number
    most_successful_code: string | null
  }

  // Recent referrals (last 5)
  recent_referrals: UserReferralWithUser[]
}

/**
 * User referral with referred user information
 */
export interface UserReferralWithUser extends UserReferral {
  referred_user: {
    id: string
    email: string
    full_name: string | null
    status: string
    created_at: string
  }
  referrer: {
    id: string
    email: string
    full_name: string | null
  }
}

/**
 * Referral code with performance metrics
 */
export interface ReferralCodeWithMetrics extends UserReferralCode {
  metrics: {
    total_uses: number
    successful_referrals: number
    last_used: string | null
  }
}

// ===============================================
// FILTER & PAGINATION TYPES
// ===============================================

export interface AffiliatesFilterState {
  searchTerm: string
  sortColumn: keyof AffiliateWithMetrics | null
  sortDirection: 'asc' | 'desc'
  statusFilter: string // 'all', 'active', 'inactive', etc.
  pageSize: number
  currentPage: number
  pageInputValue: string
}

export interface AffiliatesFilterOptions {
  statusOptions: Array<{ value: string; label: string }>
}

// ===============================================
// API RESPONSE TYPES
// ===============================================

export interface AffiliateStatsResponse {
  total_affiliates: number
  active_affiliates: number
  total_referrals: number
  total_active_codes: number
  top_performer: {
    id: string
    email: string
    full_name: string | null
    total_referrals: number
  } | null
}

export interface ReferralDetailsResponse {
  referral: UserReferralWithUser
  referrer_stats: {
    total_referrals: number
  }
}

// ===============================================
// FORM TYPES
// ===============================================

export interface CreateReferralCodeRequest {
  user_id: string
  custom_code?: string // Optional custom code, otherwise auto-generated
}



export interface UpdateReferralCodeStatusRequest {
  code_id: string
  is_active: boolean
}

export interface DeleteReferralCodeRequest {
  code_id: string
}

// ===============================================
// CONSTANTS
// ===============================================

export const AFFILIATE_FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const

export type AffiliateFilter = typeof AFFILIATE_FILTERS[keyof typeof AFFILIATE_FILTERS]
