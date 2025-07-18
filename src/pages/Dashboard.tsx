import React from 'react'
import {
  Users,
  FileText,
  Package,
  Megaphone,
  Plus,
  Edit,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react'
import { usePageTranslation, useTranslation } from '../hooks/useTranslation'
import { Badge } from '../components/atoms'

// Theme imports
import {
  getPageLayoutClasses,
  getButtonClasses,
  getStatsCardProps,
  getIconClasses,
  getTypographyClasses,
  cn
} from '../utils/theme'

const Dashboard: React.FC = () => {
  const { t } = usePageTranslation() // Page-specific content
  const { t: tCommon } = useTranslation() // Common actions and terms

  // Theme classes
  const layout = getPageLayoutClasses()

  // Mock data - in a real app, this would come from your data store
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalPosts: 156,
    publishedPosts: 134,
    totalProducts: 45,
    subscriptionProducts: 28,
    totalBanners: 12,
    activeBanners: 8
  }

  const quickActions = [
    {
      title: t('dashboard.createUser'),
      description: t('dashboard.createUserDescription'),
      icon: Users,
      color: 'blue',
      action: () => {
        // TODO: Navigate to user creation page
      }
    },
    {
      title: t('dashboard.addProduct'),
      description: t('dashboard.addProductDescription'),
      icon: Package,
      color: 'green',
      action: () => {
        // TODO: Navigate to product creation page
      }
    },
    {
      title: t('dashboard.writePost'),
      description: t('dashboard.writePostDescription'),
      icon: Edit,
      color: 'purple',
      action: () => {
        // TODO: Navigate to post creation page
      }
    },
    {
      title: t('dashboard.newBanner'),
      description: t('dashboard.newBannerDescription'),
      icon: Megaphone,
      color: 'orange',
      action: () => {
        // TODO: Navigate to banner creation page
      }
    }
  ]

  // Get theme props for cards
  const totalUsersProps = getStatsCardProps('users')
  const postsProps = getStatsCardProps('posts')
  const productsProps = getStatsCardProps('products')
  const bannersProps = getStatsCardProps('banners')

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
            <div className={totalUsersProps.cardClasses}>
              <div className='flex items-center'>
                <div className={getIconClasses('stats', 'users')}>
                  <Users className='w-6 h-6 text-white' />
                </div>
                <div className='ml-4'>
                  <div className={totalUsersProps.valueClasses}>
                    {stats.totalUsers.toLocaleString()}
                  </div>
                  <div className={totalUsersProps.labelClasses}>{tCommon('entities.users')}</div>
                </div>
              </div>
              <div className='mt-4 flex items-center space-x-2'>
                <Badge variant='active' size='sm' showIcon>
                  {stats.activeUsers} {tCommon('status.active')}
                </Badge>
              </div>
            </div>

            {/* Content Posts */}
            <div className={postsProps.cardClasses}>
              <div className='flex items-center'>
                <div className={getIconClasses('stats', 'posts')}>
                  <FileText className='w-6 h-6 text-white' />
                </div>
                <div className='ml-4'>
                  <div className={postsProps.valueClasses}>{stats.totalPosts}</div>
                  <div className={postsProps.labelClasses}>{tCommon('entities.posts')}</div>
                </div>
              </div>
              <div className='mt-4 flex items-center space-x-2'>
                <Badge variant='published' size='sm' showIcon>
                  {stats.publishedPosts} {tCommon('status.published')}
                </Badge>
              </div>
            </div>

            {/* Products */}
            <div className={productsProps.cardClasses}>
              <div className='flex items-center'>
                <div className={getIconClasses('stats', 'products')}>
                  <Package className='w-6 h-6 text-white' />
                </div>
                <div className='ml-4'>
                  <div className={productsProps.valueClasses}>{stats.totalProducts}</div>
                  <div className={productsProps.labelClasses}>{tCommon('entities.products')}</div>
                </div>
              </div>
              <div className='mt-4 flex items-center space-x-2'>
                <Badge variant='active' size='sm' showIcon>
                  {stats.subscriptionProducts} {tCommon('content.subscription')}
                </Badge>
              </div>
            </div>

            {/* Banners */}
            <div className={bannersProps.cardClasses}>
              <div className='flex items-center'>
                <div className={getIconClasses('stats', 'banners')}>
                  <Megaphone className='w-6 h-6 text-white' />
                </div>
                <div className='ml-4'>
                  <div className={bannersProps.valueClasses}>{stats.totalBanners}</div>
                  <div className={bannersProps.labelClasses}>{tCommon('entities.banners')}</div>
                </div>
              </div>
              <div className='mt-4 flex items-center space-x-2'>
                <Badge variant='active' size='sm' showIcon>
                  {stats.activeBanners} {tCommon('status.active')}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className='mb-6'>
            <h2 className={getTypographyClasses('h2')}>{t('dashboard.quickActions')}</h2>
            <p className={getTypographyClasses('description')}>
              {t('dashboard.quickActionsDescription')}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {quickActions.map((action, index) => {
              // Define color-specific styles for light and dark themes
              const getCardStyles = (color: string) => {
                const colorStyles = {
                  blue: 'bg-white dark:bg-blue-900/20 border-gray-200 dark:border-blue-800/30 hover:border-gray-300 dark:hover:border-blue-700/50',
                  green: 'bg-white dark:bg-green-900/20 border-gray-200 dark:border-green-800/30 hover:border-gray-300 dark:hover:border-green-700/50',
                  purple: 'bg-white dark:bg-purple-900/20 border-gray-200 dark:border-purple-800/30 hover:border-gray-300 dark:hover:border-purple-700/50',
                  orange: 'bg-white dark:bg-orange-900/20 border-gray-200 dark:border-orange-800/30 hover:border-gray-300 dark:hover:border-orange-700/50'
                }
                return colorStyles[color as keyof typeof colorStyles] || colorStyles.blue
              }

              const getIconStyles = (color: string) => {
                const iconStyles = {
                  blue: 'p-3 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/30 transition-colors',
                  green: 'p-3 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-500/30 transition-colors',
                  purple: 'p-3 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/30 transition-colors',
                  orange: 'p-3 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-200 dark:group-hover:bg-orange-500/30 transition-colors'
                }
                return iconStyles[color as keyof typeof iconStyles] || iconStyles.blue
              }

              return (
                <div
                  key={index}
                  className={cn(
                    'p-6 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer group',
                    getCardStyles(action.color)
                  )}
                  onClick={action.action}
                >
                  <div className='flex items-center mb-4'>
                    <div className={getIconStyles(action.color)}>
                      <action.icon className='w-6 h-6' />
                    </div>
                  </div>
                  <h3 className={cn(getTypographyClasses('h4'), 'mb-2', 'dark:text-white')}>{action.title}</h3>
                  <p className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300')}>
                    {action.description}
                  </p>
                  <div className='mt-4'>
                    <button className={cn(getButtonClasses('primary', 'sm'), 'w-full')}>
                      <Plus className='w-4 h-4 mr-2' />
                      {tCommon('actions.create')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Statistics */}
        <div>
          <div className='mb-6'>
            <h2 className={getTypographyClasses('h2')}>{t('dashboard.quickStatistics')}</h2>
            <p className={getTypographyClasses('description')}>
              {t('dashboard.quickStatisticsDescription')}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* User Growth */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className={cn(getTypographyClasses('h4'), 'dark:text-white')}>{t('dashboard.userGrowthRate')}</h3>
                <TrendingUp className='w-5 h-5 text-green-500' />
              </div>
              <div className='space-y-2'>
                <div className={cn(getTypographyClasses('large'), 'dark:text-white')}>+12.5%</div>
                <p className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300')}>vs last month</p>
              </div>
            </div>

            {/* Content Published */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className={cn(getTypographyClasses('h4'), 'dark:text-white')}>{t('dashboard.contentPublished')}</h3>
                <Activity className='w-5 h-5 text-blue-500' />
              </div>
              <div className='space-y-2'>
                <div className={cn(getTypographyClasses('large'), 'dark:text-white')}>23</div>
                <p className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300')}>this month</p>
              </div>
            </div>

            {/* Banner Activity */}
            <div className='bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className={cn(getTypographyClasses('h4'), 'dark:text-white')}>{t('dashboard.bannerActivity')}</h3>
                <BarChart3 className='w-5 h-5 text-purple-500' />
              </div>
              <div className='space-y-2'>
                <div className={cn(getTypographyClasses('large'), 'dark:text-white')}>67%</div>
                <p className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300')}>
                  {tCommon('status.active')} rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
