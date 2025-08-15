// 🎯 Affiliate Management API Hooks
// React Query hooks for affiliate-related API operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { toast } from '../../../utils/toast'
import { useTranslation } from '../../../hooks/useTranslation'
import type {
  AffiliateWithMetrics,
  UserReferralWithUser,
  AffiliateStatsResponse,
  CreateReferralCodeRequest,
  UpdateReferralCodeStatusRequest,
  DeleteReferralCodeRequest,
  UserReferralCode
} from '../../../types/affiliates'

// ===============================================
// QUERY KEY FACTORIES
// ===============================================

export const affiliateQueryKeys = {
  all: ['affiliates'] as const,
  lists: () => [...affiliateQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...affiliateQueryKeys.lists(), { filters }] as const,
  details: () => [...affiliateQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...affiliateQueryKeys.details(), id] as const,
  stats: () => [...affiliateQueryKeys.all, 'stats'] as const,
  referrals: () => [...affiliateQueryKeys.all, 'referrals'] as const,
  referralsByAffiliate: (affiliateId: string) => [...affiliateQueryKeys.referrals(), affiliateId] as const,
  codes: () => [...affiliateQueryKeys.all, 'codes'] as const,
  codesByAffiliate: (affiliateId: string) => [...affiliateQueryKeys.codes(), affiliateId] as const,
}

// ===============================================
// DATA FETCHING FUNCTIONS
// ===============================================

/**
 * Fetch all affiliate users with their metrics
 */
const fetchAffiliates = async (): Promise<AffiliateWithMetrics[]> => {
  console.warn('🔄 Fetching affiliates with metrics...')

  // First, get all affiliate users
  const { data: affiliateUsers, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'affiliate')
    .order('created_at', { ascending: false })

  if (usersError) {
    console.error('❌ Error fetching affiliate users:', usersError)
    throw usersError
  }

  // For each affiliate, get their referral codes and metrics
  const affiliatesWithMetrics: AffiliateWithMetrics[] = await Promise.all(
    affiliateUsers.map(async (user) => {
      // Get referral codes
      const { data: referralCodes, error: codesError } = await supabase
        .from('user_referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (codesError) {
        console.error(`❌ Error fetching referral codes for user ${user.id}:`, codesError)
      }

      // Get referrals made by this affiliate
      const { data: referrals, error: referralsError } = await supabase
        .from('user_referrals')
        .select(`
          *,
          referred_user:users!user_referrals_referred_user_id_fkey(id, email, full_name, status, created_at)
        `)
        .eq('referrer_id', user.id)
        .order('referred_at', { ascending: false })

      if (referralsError) {
        console.error(`❌ Error fetching referrals for user ${user.id}:`, referralsError)
      }

      // Calculate metrics
      const totalReferrals = referrals?.length || 0
      const totalActiveCodes = referralCodes?.filter(code => code.is_active).length || 0

      // Find most successful code
      let mostSuccessfulCode: string | null = null
      if (referralCodes && referralCodes.length > 0) {
        const codeUsage = referralCodes.reduce((acc, code) => {
          const uses = referrals?.filter(r => r.referral_code === code.referral_code).length || 0
          acc[code.referral_code] = uses
          return acc
        }, {} as Record<string, number>)

        const maxUses = Math.max(...Object.values(codeUsage))
        if (maxUses > 0) {
          mostSuccessfulCode = Object.keys(codeUsage).find(code => codeUsage[code] === maxUses) || null
        }
      }

      // Get recent referrals (last 5)
      const recentReferrals: UserReferralWithUser[] = (referrals?.slice(0, 5) || []).map(referral => ({
        ...referral,
        referrer: {
          id: user.id,
          email: user.email,
          full_name: user.full_name
        },
        referred_user: referral.referred_user
      }))

      return {
        ...user,
        role: 'affiliate' as const,
        referral_codes: referralCodes || [],
        metrics: {
          total_referrals: totalReferrals,
          total_active_codes: totalActiveCodes,
          most_successful_code: mostSuccessfulCode
        },
        recent_referrals: recentReferrals
      }
    })
  )

  console.warn('✅ Successfully fetched affiliates with metrics:', affiliatesWithMetrics.length)
  return affiliatesWithMetrics
}

/**
 * Fetch affiliate statistics for dashboard
 */
const fetchAffiliateStats = async (): Promise<AffiliateStatsResponse> => {
  console.warn('🔄 Fetching affiliate statistics...')

  // Get total affiliate count
  const { count: totalAffiliates, error: affiliatesCountError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'affiliate')

  if (affiliatesCountError) {
    console.error('❌ Error fetching affiliate count:', affiliatesCountError)
    throw affiliatesCountError
  }

  // Get active affiliate count
  const { count: activeAffiliates, error: activeAffiliatesError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'affiliate')
    .eq('status', 'active')

  if (activeAffiliatesError) {
    console.error('❌ Error fetching active affiliate count:', activeAffiliatesError)
    throw activeAffiliatesError
  }

  // Get total referrals
  const { count: totalReferrals, error: referralsCountError } = await supabase
    .from('user_referrals')
    .select('*', { count: 'exact', head: true })

  if (referralsCountError) {
    console.error('❌ Error fetching referrals count:', referralsCountError)
    throw referralsCountError
  }

  // No need to separate confirmed vs pending referrals anymore

  // Get total active codes
  const { count: totalActiveCodes, error: activeCodesError } = await supabase
    .from('user_referral_codes')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (activeCodesError) {
    console.error('❌ Error fetching active codes count:', activeCodesError)
    throw activeCodesError
  }

  // Get top performer (based on total referrals)
  const { data: referralCounts, error: topPerformerError } = await supabase
    .from('user_referrals')
    .select(`
      referrer_id,
      referrer:users!user_referrals_referrer_id_fkey(id, email, full_name)
    `)

  if (topPerformerError) {
    console.error('❌ Error fetching top performer data:', topPerformerError)
  }

  let topPerformer = null
  if (referralCounts && referralCounts.length > 0) {
    const performerCounts = referralCounts.reduce((acc, referral) => {
      const referrerId = referral.referrer_id
      if (!acc[referrerId]) {
        acc[referrerId] = {
          user: referral.referrer,
          count: 0
        }
      }
      acc[referrerId].count++
      return acc
    }, {} as Record<string, { user: { id: string; email: string; full_name: string | null }; count: number }>)

    const topPerformerData = Object.values(performerCounts).reduce((max, current) =>
      current.count > max.count ? current : max
    )

    if (topPerformerData.count > 0) {
      topPerformer = {
        id: topPerformerData.user.id,
        email: topPerformerData.user.email,
        full_name: topPerformerData.user.full_name,
        total_referrals: topPerformerData.count
      }
    }
  }

  const stats: AffiliateStatsResponse = {
    total_affiliates: totalAffiliates || 0,
    active_affiliates: activeAffiliates || 0,
    total_referrals: totalReferrals || 0,
    total_active_codes: totalActiveCodes || 0,
    top_performer: topPerformer
  }

  console.warn('✅ Successfully fetched affiliate statistics:', stats)
  return stats
}

/**
 * Fetch referrals for a specific affiliate
 */
const fetchAffiliateReferrals = async (affiliateId: string): Promise<UserReferralWithUser[]> => {
  console.warn(`🔄 Fetching referrals for affiliate ${affiliateId}...`)

  const { data: referrals, error } = await supabase
    .from('user_referrals')
    .select(`
      *,
      referred_user:users!user_referrals_referred_user_id_fkey(id, email, full_name, status, created_at),
      referrer:users!user_referrals_referrer_id_fkey(id, email, full_name)
    `)
    .eq('referrer_id', affiliateId)
    .order('referred_at', { ascending: false })

  if (error) {
    console.error(`❌ Error fetching referrals for affiliate ${affiliateId}:`, error)
    throw error
  }

  console.warn(`✅ Successfully fetched ${referrals.length} referrals for affiliate ${affiliateId}`)
  return referrals as UserReferralWithUser[]
}

/**
 * Fetch referral codes for a specific affiliate
 */
const fetchAffiliateReferralCodes = async (affiliateId: string): Promise<UserReferralCode[]> => {
  console.warn(`🔄 Fetching referral codes for affiliate ${affiliateId}...`)

  const { data: codes, error } = await supabase
    .from('user_referral_codes')
    .select('*')
    .eq('user_id', affiliateId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`❌ Error fetching referral codes for affiliate ${affiliateId}:`, error)
    throw error
  }

  console.warn(`✅ Successfully fetched ${codes.length} referral codes for affiliate ${affiliateId}`)
  return codes
}

/**
 * Create a new referral code for an affiliate
 */
const createReferralCode = async (request: CreateReferralCodeRequest): Promise<UserReferralCode> => {
  console.warn('🔄 Creating referral code...', request)

  // First, check if user already has an active referral code
  const { data: existingCodes, error: checkError } = await supabase
    .from('user_referral_codes')
    .select('*')
    .eq('user_id', request.user_id)
    .eq('is_active', true)

  if (checkError) {
    console.error('❌ Error checking existing referral codes:', checkError)
    throw checkError
  }

  if (existingCodes && existingCodes.length > 0) {
    // Get user info for the error message
    const { data: user, error: _userError } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', request.user_id)
      .single()

    const userName = user?.full_name || user?.email || 'Affiliate'

    // Create a custom error with a specific type so we can handle it differently
    const error = new Error(`Affiliate ${userName} already has an active referral code`)
    error.name = 'ReferralCodeAlreadyExists'
    throw error
  }

  const { data, error } = await supabase.rpc('create_user_referral_code', {
    user_uuid: request.user_id
  })

  if (error) {
    console.error('❌ Error creating referral code:', error)
    throw error
  }

  // Return the created code by fetching it
  const { data: newCode, error: fetchError } = await supabase
    .from('user_referral_codes')
    .select('*')
    .eq('referral_code', data)
    .eq('user_id', request.user_id)
    .single()

  if (fetchError) {
    console.error('❌ Error fetching created referral code:', fetchError)
    throw fetchError
  }

  console.warn('✅ Successfully created referral code:', newCode)
  return newCode
}



/**
 * Update referral code status (active/inactive)
 */
const updateReferralCodeStatus = async (request: UpdateReferralCodeStatusRequest): Promise<UserReferralCode> => {
  console.warn('🔄 Updating referral code status...', request)

  const { data, error } = await supabase
    .from('user_referral_codes')
    .update({ is_active: request.is_active })
    .eq('id', request.code_id)
    .select()
    .single()

  if (error) {
    console.error('❌ Error updating referral code status:', error)
    throw error
  }

  console.warn('✅ Successfully updated referral code status:', data)
  return data
}

/**
 * Delete referral code
 */
const deleteReferralCode = async (request: DeleteReferralCodeRequest): Promise<void> => {
  console.warn('🔄 Deleting referral code...', request)

  const { error } = await supabase
    .from('user_referral_codes')
    .delete()
    .eq('id', request.code_id)

  if (error) {
    console.error('❌ Error deleting referral code:', error)
    throw error
  }

  console.warn('✅ Successfully deleted referral code')
}

// ===============================================
// REACT QUERY HOOKS
// ===============================================

/**
 * Hook to fetch all affiliates with metrics
 */
export const useAffiliates = () => {
  return useQuery({
    queryKey: affiliateQueryKeys.lists(),
    queryFn: fetchAffiliates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch affiliate statistics
 */
export const useAffiliateStats = () => {
  return useQuery({
    queryKey: affiliateQueryKeys.stats(),
    queryFn: fetchAffiliateStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch referrals for a specific affiliate
 */
export const useAffiliateReferrals = (affiliateId: string) => {
  return useQuery({
    queryKey: affiliateQueryKeys.referralsByAffiliate(affiliateId),
    queryFn: () => fetchAffiliateReferrals(affiliateId),
    enabled: !!affiliateId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 6 * 60 * 1000, // 6 minutes
  })
}

/**
 * Hook to fetch referral codes for a specific affiliate
 */
export const useAffiliateReferralCodes = (affiliateId: string) => {
  return useQuery({
    queryKey: affiliateQueryKeys.codesByAffiliate(affiliateId),
    queryFn: () => fetchAffiliateReferralCodes(affiliateId),
    enabled: !!affiliateId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to create a referral code
 */
export const useCreateReferralCode = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: createReferralCode,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: affiliateQueryKeys.codesByAffiliate(variables.user_id) })

      // Snapshot previous value
      const previousCodes = queryClient.getQueryData<UserReferralCode[]>(
        affiliateQueryKeys.codesByAffiliate(variables.user_id)
      )

      // Don't add optimistic update since we're checking for existing codes first
      return { previousCodes }
    },
    onSuccess: (data, variables) => {
      // Update the cache directly with the new code instead of invalidating
      queryClient.setQueryData<UserReferralCode[]>(
        affiliateQueryKeys.codesByAffiliate(variables.user_id),
        (old) => [data, ...(old || [])]
      )

      // Only invalidate the main affiliates list to update metrics (less expensive)
      queryClient.invalidateQueries({
        queryKey: affiliateQueryKeys.lists(),
        exact: true
      })

      toast.success(t('notifications.toast.success.referralCodeCreated'))
    },
    onError: (error: Error, variables, context) => {
      console.error('❌ Create referral code error:', error)

      // Rollback on error
      if (context?.previousCodes) {
        queryClient.setQueryData(
          affiliateQueryKeys.codesByAffiliate(variables.user_id),
          context.previousCodes
        )
      }

      // Handle specific error types
      if (error.name === 'ReferralCodeAlreadyExists') {
        toast.error(error.message)
      } else {
        toast.error(error.message || t('notifications.toast.error.failedToCreateReferralCode'))
      }
    },
  })
}



/**
 * Hook to update referral code status
 */
export const useUpdateReferralCodeStatus = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: updateReferralCodeStatus,
    onMutate: async (variables) => {
      // Find the user_id by looking at the cached data
      const affiliatesData = queryClient.getQueryData<AffiliateWithMetrics[]>(affiliateQueryKeys.lists())
      const affiliate = affiliatesData?.find(aff =>
        aff.referral_codes.some(code => code.id === variables.code_id)
      )

      if (affiliate) {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: affiliateQueryKeys.codesByAffiliate(affiliate.id) })

        // Snapshot previous value
        const previousCodes = queryClient.getQueryData<UserReferralCode[]>(
          affiliateQueryKeys.codesByAffiliate(affiliate.id)
        )

        // Optimistically update
        queryClient.setQueryData<UserReferralCode[]>(
          affiliateQueryKeys.codesByAffiliate(affiliate.id),
          (old) => old?.map(code =>
            code.id === variables.code_id
              ? { ...code, is_active: variables.is_active }
              : code
          ) || []
        )

        return { previousCodes, affiliateId: affiliate.id }
      }
    },
    onSuccess: (data, variables, context) => {
      // Update the cache directly with the real data
      if (context?.affiliateId) {
        queryClient.setQueryData<UserReferralCode[]>(
          affiliateQueryKeys.codesByAffiliate(context.affiliateId),
          (old) => old?.map(code =>
            code.id === variables.code_id
              ? { ...code, ...data } // Merge with real server response
              : code
          ) || []
        )

        // Only invalidate the main affiliates list to update metrics if active status changed
        queryClient.invalidateQueries({
          queryKey: affiliateQueryKeys.lists(),
          exact: true
        })
      }
      toast.success(t('notifications.toast.success.referralCodeStatusUpdated'))
    },
    onError: (error: Error, variables, context) => {
      console.error('❌ Update referral code status error:', error)

      // Rollback on error
      if (context?.previousCodes && context?.affiliateId) {
        queryClient.setQueryData(
          affiliateQueryKeys.codesByAffiliate(context.affiliateId),
          context.previousCodes
        )
      }

      toast.error(error.message || t('notifications.toast.error.failedToUpdateReferralCodeStatus'))
    },
  })
}

/**
 * Hook to delete referral code
 */
export const useDeleteReferralCode = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: deleteReferralCode,
    onMutate: async (variables) => {
      // Find the user_id by looking at the cached data
      const affiliatesData = queryClient.getQueryData<AffiliateWithMetrics[]>(affiliateQueryKeys.lists())
      const affiliate = affiliatesData?.find(aff =>
        aff.referral_codes.some(code => code.id === variables.code_id)
      )

      if (affiliate) {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: affiliateQueryKeys.codesByAffiliate(affiliate.id) })

        // Snapshot previous value
        const previousCodes = queryClient.getQueryData<UserReferralCode[]>(
          affiliateQueryKeys.codesByAffiliate(affiliate.id)
        )

        // Optimistically update by removing the code
        queryClient.setQueryData<UserReferralCode[]>(
          affiliateQueryKeys.codesByAffiliate(affiliate.id),
          (old) => old?.filter(code => code.id !== variables.code_id) || []
        )

        return { previousCodes, affiliateId: affiliate.id }
      }
    },
    onSuccess: (data, variables, context) => {
      // No need to update cache as optimistic update already removed the item
      // Just invalidate the main affiliates list to update metrics
      if (context?.affiliateId) {
        queryClient.invalidateQueries({
          queryKey: affiliateQueryKeys.lists(),
          exact: true
        })
      }
      toast.success(t('notifications.toast.success.referralCodeDeleted'))
    },
    onError: (error: Error, variables, context) => {
      console.error('❌ Delete referral code error:', error)

      // Rollback on error
      if (context?.previousCodes && context?.affiliateId) {
        queryClient.setQueryData(
          affiliateQueryKeys.codesByAffiliate(context.affiliateId),
          context.previousCodes
        )
      }

      toast.error(error.message || t('notifications.toast.error.failedToDeleteReferralCode'))
    },
  })
}
