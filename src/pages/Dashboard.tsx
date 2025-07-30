import React from 'react'
import {
  Users,
  FileText,
  Package,
  Megaphone,
  BarChart3,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import { useDashboardStats } from '../hooks/useDashboardStats'

// Components
import {
  StatCard,
  RecentActivityCard,
  AnalyticsCard
} from '../components/features/dashboard'

// Theme imports
import {
  getPageLayoutClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'

const Dashboard: React.FC = () => {
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms

  // Hooks for real data
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats()

  // Theme classes
  const layout = getPageLayoutClasses()


  // Show error state if stats failed to load
  if (statsError && !statsLoading) {
    return (
      <div className={layout.container}>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={cn(getTypographyClasses('h2'), 'mb-2')}>
            Failed to load dashboard data
          </h2>
          <p className={getTypographyClasses('description')}>
            {statsError.message || 'An error occurred while fetching dashboard statistics'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={layout.container}>
      <div className='space-y-8'>
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('dashboard.title')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('dashboard.welcomeMessage')}
            </p>
          </div>
        </div>

        {/* System Overview */}
        <div>
          <div className='mb-6'>
            <h2 className={getTypographyClasses('h2')}>{t('dashboard.systemOverview')}</h2>
            <p className={getTypographyClasses('description')}>
              {t('dashboard.systemOverviewDescription')}
            </p>
          </div>

          <div className={layout.grid}>
            {/* Total Users */}
            <StatCard
              title={tCommon('entities.users')}
              value={stats.users.total}
              icon={Users}
              type="users"
              badge={{
                text: `${stats.users.active} ${tCommon('status.active')}`,
                variant: 'active',
                showIcon: true
              }}
              trend={{
                value: `${stats.users.newThisMonth}`,
                isPositive: stats.users.newThisMonth > 0,
                description: 'new this month'
              }}
              loading={statsLoading}
            />

            {/* Content Posts */}
            <StatCard
              title={tCommon('entities.posts')}
              value={stats.posts.total}
              icon={FileText}
              type="posts"
              badge={{
                text: `${stats.posts.published} ${tCommon('status.published')}`,
                variant: 'published',
                showIcon: true
              }}
              trend={{
                value: `${stats.posts.views.toLocaleString()} views`,
                isPositive: stats.posts.views > 0,
                description: 'total views'
              }}
              loading={statsLoading}
            />

            {/* Products */}
            <StatCard
              title={tCommon('entities.products')}
              value={stats.products.total}
              icon={Package}
              type="products"
              badge={{
                text: `${stats.products.withAffiliateLink} with affiliate`,
                variant: 'active',
                showIcon: true
              }}
              trend={{
                value: `$${stats.products.averagePrice}`,
                isPositive: stats.products.averagePrice > 0,
                description: 'avg price'
              }}
              loading={statsLoading}
            />

            {/* Banners */}
            <StatCard
              title={tCommon('entities.banners')}
              value={stats.banners.total}
              icon={Megaphone}
              type="banners"
              badge={{
                text: `${stats.banners.active} ${tCommon('status.active')}`,
                variant: 'active',
                showIcon: true
              }}
              trend={{
                value: `${stats.banners.visibilityRate}%`,
                isPositive: stats.banners.visibilityRate > 50,
                description: 'visibility rate'
              }}
              loading={statsLoading}
            />
          </div>
        </div>


        {/* Analytics Cards */}
        <div>
          <div className='mb-6'>
            <h2 className={getTypographyClasses('h2')}>{t('dashboard.quickStatistics')}</h2>
            <p className={getTypographyClasses('description')}>
              {t('dashboard.quickStatisticsDescription')}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {/* User Growth */}
            <AnalyticsCard
              title={t('dashboard.userGrowthRate')}
              value={`+${stats.users.newThisMonth}`}
              icon={TrendingUp}
              iconColor="text-green-500"
              description="new users this month"
              trend={{
                value: stats.users.newThisMonth > 0 ? '+12.5%' : '0%',
                isPositive: stats.users.newThisMonth > 0
              }}
              loading={statsLoading}
            />

            {/* Content Published */}
            <AnalyticsCard
              title={t('dashboard.contentPublished')}
              value={stats.posts.newThisMonth}
              icon={Activity}
              iconColor="text-blue-500"
              description="posts this month"
              trend={{
                value: `${stats.posts.published}/${stats.posts.total}`,
                isPositive: stats.posts.published > stats.posts.draft
              }}
              loading={statsLoading}
            />

            {/* Banner Activity */}
            <AnalyticsCard
              title={t('dashboard.bannerActivity')}
              value={`${stats.banners.visibilityRate}%`}
              icon={BarChart3}
              iconColor="text-purple-500"
              description={`${tCommon('status.active')} rate`}
              trend={{
                value: `${stats.banners.active}/${stats.banners.total}`,
                isPositive: stats.banners.visibilityRate > 50
              }}
              loading={statsLoading}
            />

            {/* Total Content Views */}
            <AnalyticsCard
              title="Total Views"
              value={stats.posts.views.toLocaleString()}
              icon={Activity}
              iconColor="text-indigo-500"
              description="across all content"
              trend={{
                value: stats.posts.views > 10000 ? 'High' : 'Growing',
                isPositive: stats.posts.views > 0
              }}
              loading={statsLoading}
            />
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div>
          <RecentActivityCard />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
