import React from 'react'
import { Building2, MapPin, Calendar, FileText } from 'lucide-react'
import { usePageTranslation } from '../../../hooks/useTranslation'
import { getPageLayoutClasses, getStatsCardProps, getIconClasses } from '../../../utils/theme'
import type { Broker } from '../../../types'

interface BrokersStatsProps {
  brokers: Broker[]
}

interface StatsData {
  totalBrokers: number
  brokersWithHQ: number
  brokersWithEstDate: number
  recentBrokers: number
}

const BrokersStats: React.FC<BrokersStatsProps> = ({ brokers }) => {
  const { t } = usePageTranslation()
  const layout = getPageLayoutClasses()

  // Calculate stats
  const stats: StatsData = React.useMemo(() => {
    const totalBrokers = brokers.length
    const brokersWithHQ = brokers.filter(b => b.headquarter).length
    const brokersWithEstDate = brokers.filter(b => b.established_in).length
    const recentBrokers = brokers.filter(
      b => new Date(b.created_at || 0) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length

    return {
      totalBrokers,
      brokersWithHQ,
      brokersWithEstDate,
      recentBrokers
    }
  }, [brokers])

  // Theme props for each stat card
  const totalBrokersProps = getStatsCardProps('products')
  const hqProps = getStatsCardProps('users')
  const estDateProps = getStatsCardProps('posts')
  const recentProps = getStatsCardProps('banners')

  return (
    <div className={layout.grid}>
      {/* Total Brokers */}
      <div className={totalBrokersProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'products')}>
            <Building2 className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={totalBrokersProps.valueClasses}>{stats.totalBrokers}</div>
            <div className={totalBrokersProps.labelClasses}>{t('brokers.totalBrokers')}</div>
          </div>
        </div>
      </div>

      {/* Brokers with Headquarters */}
      <div className={hqProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'users')}>
            <MapPin className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={hqProps.valueClasses}>{stats.brokersWithHQ}</div>
            <div className={hqProps.labelClasses}>{t('brokers.withHeadquarters')}</div>
          </div>
        </div>
      </div>

      {/* Brokers with Establishment Date */}
      <div className={estDateProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'posts')}>
            <Calendar className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={estDateProps.valueClasses}>{stats.brokersWithEstDate}</div>
            <div className={estDateProps.labelClasses}>{t('brokers.withEstDate')}</div>
          </div>
        </div>
      </div>

      {/* Recent Brokers (30 days) */}
      <div className={recentProps.cardClasses}>
        <div className='flex items-center'>
          <div className={getIconClasses('stats', 'banners')}>
            <FileText className='w-6 h-6 text-white' />
          </div>
          <div className='ml-4'>
            <div className={recentProps.valueClasses}>{stats.recentBrokers}</div>
            <div className={recentProps.labelClasses}>{t('brokers.recent30d')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BrokersStats
