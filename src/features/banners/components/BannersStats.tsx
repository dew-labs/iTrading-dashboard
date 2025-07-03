import React from 'react'
import { Image, CheckCircle, XCircle, Activity } from 'lucide-react'
import { usePageTranslation, useTranslation } from '../../../hooks/useTranslation'
import { getPageLayoutClasses, getStatsCardProps, getIconClasses } from '../../../utils/theme'
import type { Banner } from '../../../types'

interface BannersStatsProps {
  banners: Banner[]
}

interface StatsData {
  totalBanners: number
  activeBanners: number
  inactiveBanners: number
  activeRate: number
}

const BannersStats: React.FC<BannersStatsProps> = ({ banners }) => {
  const { t } = usePageTranslation()
  const { t: tCommon } = useTranslation()
  const layout = getPageLayoutClasses()

  // Calculate stats
  const stats: StatsData = React.useMemo(() => {
    const activeBanners = banners.filter(b => b.is_visible).length
    const inactiveBanners = banners.filter(b => !b.is_visible).length
    const activeRate = banners.length > 0 ? (activeBanners / banners.length) * 100 : 0

    return {
      totalBanners: banners.length,
      activeBanners,
      inactiveBanners,
      activeRate
    }
  }, [banners])

  // Theme props for each stat card
  const totalBannersProps = getStatsCardProps('banners')
  const activeProps = getStatsCardProps('banners')
  const inactiveProps = getStatsCardProps('banners')
  const rateProps = getStatsCardProps('banners')

  return (
    <div className={layout.grid}>
      {/* Total Banners */}
      <div className={totalBannersProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'banners')}>
            <Image className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={totalBannersProps.valueClasses}>{stats.totalBanners}</div>
            <div className={totalBannersProps.labelClasses}>{t('banners.totalBanners')}</div>
          </div>
        </div>
      </div>

      {/* Active Banners */}
      <div className={activeProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'posts')}>
            <CheckCircle className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={activeProps.valueClasses}>{stats.activeBanners}</div>
            <div className={activeProps.labelClasses}>{tCommon('status.active')}</div>
          </div>
        </div>
      </div>

      {/* Inactive Banners */}
      <div className={inactiveProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'users')}>
            <XCircle className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={inactiveProps.valueClasses}>{stats.inactiveBanners}</div>
            <div className={inactiveProps.labelClasses}>{tCommon('status.inactive')}</div>
          </div>
        </div>
      </div>

      {/* Active Rate */}
      <div className={rateProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'products')}>
            <Activity className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={rateProps.valueClasses}>{stats.activeRate.toFixed(0)}%</div>
            <div className={rateProps.labelClasses}>{t('banners.activeRate')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BannersStats
