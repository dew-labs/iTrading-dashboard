// 🎯 Affiliates Statistics Component
// Displays key metrics and performance indicators for affiliate management

import React from 'react'
import { Users, Key, HandCoins } from 'lucide-react'
import { usePageTranslation } from '../../../hooks/useTranslation'
import type { AffiliateStatsResponse } from '../../../types/affiliates'
import { getPageLayoutClasses, getStatsCardProps, getIconClasses } from '../../../utils/theme'

interface AffiliatesStatsProps {
  stats: AffiliateStatsResponse
  loading?: boolean
}

const AffiliatesStats: React.FC<AffiliatesStatsProps> = ({ stats, loading = false }) => {
  const { t } = usePageTranslation()
  const layout = getPageLayoutClasses()

  // Theme props for each stat card
  const totalAffiliatesProps = getStatsCardProps('users')
  const totalReferralsProps = getStatsCardProps('products')
  const activeCodesProps = getStatsCardProps('banners')

  if (loading) {
    return (
      <div className={layout.grid}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-24" />
        ))}
      </div>
    )
  }

  return (
    <div className={layout.grid}>
      {/* Total Affiliates */}
      <div className={totalAffiliatesProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'users')}>
            <HandCoins className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={totalAffiliatesProps.valueClasses}>{stats.total_affiliates}</div>
            <div className={totalAffiliatesProps.labelClasses}>
              {t('affiliates.stats.totalAffiliates')}
            </div>
          </div>
        </div>
      </div>



      {/* Total Referrals */}
      <div className={totalReferralsProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'products')}>
            <Users className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={totalReferralsProps.valueClasses}>{stats.total_referrals}</div>
            <div className={totalReferralsProps.labelClasses}>
              {t('affiliates.stats.totalReferrals')}
            </div>
          </div>
        </div>
      </div>



      {/* Active Referral Codes */}
      <div className={activeCodesProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'banners')}>
            <Key className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={activeCodesProps.valueClasses}>{stats.total_active_codes}</div>
            <div className={activeCodesProps.labelClasses}>
              {t('affiliates.stats.activeCodes')}
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}

export default React.memo(AffiliatesStats)
