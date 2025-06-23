import React from 'react'
import { Users, Package, FileText, Image, Plus, TrendingUp, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useUsers } from '../hooks/useUsers'
import { useProducts } from '../hooks/useProducts'
import { usePosts } from '../hooks/usePosts'
import { useBanners } from '../hooks/useBanners'
import { useTranslation } from '../hooks/useTranslation'
import PageLoadingSpinner from '../components/PageLoadingSpinner'

// Theme imports
import {
  getPageLayoutClasses,
  getButtonClasses,
  getStatsCardProps,
  getIconClasses,
  getTypographyClasses,
  getCardClasses,
  cn
} from '../utils/theme'

const Dashboard: React.FC = () => {
  const { t } = useTranslation()
  const { users, loading: usersLoading } = useUsers()
  const { products, loading: productsLoading } = useProducts()
  const { posts, loading: postsLoading } = usePosts()
  const { banners, loading: bannersLoading } = useBanners()

  // Theme classes
  const layout = getPageLayoutClasses()

  const isLoading = usersLoading || productsLoading || postsLoading || bannersLoading

  // Calculate stats
  const activeUsers = users.filter((u) => u.status === 'active').length
  const activeBanners = banners.filter((b) => b.is_active).length
  const publishedPosts = posts.filter((p) => p.status === 'published').length

  // Quick actions
  const quickActions = [
    {
      titleKey: 'createUser',
      descriptionKey: 'createUserDescription',
      icon: Users,
      path: '/users',
      color: 'users',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      titleKey: 'addProduct',
      descriptionKey: 'addProductDescription',
      icon: Package,
      path: '/products',
      color: 'products',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      titleKey: 'writePost',
      descriptionKey: 'writePostDescription',
      icon: FileText,
      path: '/posts',
      color: 'posts',
      gradient: 'from-green-500 to-green-600'
    },
    {
      titleKey: 'newBanner',
      descriptionKey: 'newBannerDescription',
      icon: Image,
      path: '/banners',
      color: 'banners',
      gradient: 'from-teal-500 to-teal-600'
    }
  ]

  // Stats with themed props
  const userStatsProps = getStatsCardProps('users')
  const productStatsProps = getStatsCardProps('products')
  const postStatsProps = getStatsCardProps('posts')
  const bannerStatsProps = getStatsCardProps('banners')

  if (isLoading) {
    return (
      <div className={layout.container}>
        <PageLoadingSpinner message={t('loadingDashboard')} />
      </div>
    )
  }

  return (
    <div className={layout.container}>
      <div className="space-y-6">
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('dashboard')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('welcomeMessage')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <Link to="/settings" className={getButtonClasses('secondary', 'md')}>
              <Settings className="w-4 h-4 mr-2" />
              {t('settings')}
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={layout.grid}>
          <div className={userStatsProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'users')}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={userStatsProps.valueClasses}>{users.length}</div>
                <div className={userStatsProps.labelClasses}>{t('totalUsers')}</div>
                <div className={cn(getTypographyClasses('xs'), 'text-green-600 mt-1')}>
                  {activeUsers} {t('active')}
                </div>
              </div>
            </div>
          </div>

          <div className={productStatsProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'products')}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={productStatsProps.valueClasses}>{products.length}</div>
                <div className={productStatsProps.labelClasses}>{t('productsLabel')}</div>
                <div className={cn(getTypographyClasses('xs'), 'text-purple-600 mt-1')}>
                  {products.filter(p => p.subscription).length} {t('subscriptions')}
                </div>
              </div>
            </div>
          </div>

          <div className={postStatsProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'posts')}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={postStatsProps.valueClasses}>{posts.length}</div>
                <div className={postStatsProps.labelClasses}>{t('contentPosts')}</div>
                <div className={cn(getTypographyClasses('xs'), 'text-green-600 mt-1')}>
                  {publishedPosts} {t('published')}
                </div>
              </div>
            </div>
          </div>

          <div className={bannerStatsProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'banners')}>
                <Image className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={bannerStatsProps.valueClasses}>{banners.length}</div>
                <div className={bannerStatsProps.labelClasses}>{t('bannersLabel')}</div>
                <div className={cn(getTypographyClasses('xs'), 'text-teal-600 mt-1')}>
                  {activeBanners} {t('active')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={getCardClasses('base')}>
          <div className="p-6">
            <h2 className={getTypographyClasses('h2')}>{t('quickActions')}</h2>
            <p className={cn(getTypographyClasses('description'), 'mt-1')}>
              {t('quickActionsDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 pt-0">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />

                  <div className="relative flex items-center space-x-4">
                    <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={cn(getTypographyClasses('h4'), 'group-hover:text-gray-700')}>
                        {t(action.titleKey)}
                      </h3>
                      <p className={cn(getTypographyClasses('small'), 'mt-1')}>
                        {t(action.descriptionKey)}
                      </p>
                    </div>
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Overview */}
          <div className={getCardClasses('base')}>
            <div className="p-6">
              <h3 className={getTypographyClasses('h3')}>{t('systemOverview')}</h3>
              <p className={cn(getTypographyClasses('small'), 'mt-1 mb-4')}>
                {t('systemOverviewDescription')}
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={getIconClasses('stats', 'users')}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className={getTypographyClasses('small')}>{t('activeUsers')}</span>
                  </div>
                  <span className={cn(getTypographyClasses('h4'), 'text-blue-600')}>
                    {activeUsers}/{users.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={getIconClasses('stats', 'posts')}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className={getTypographyClasses('small')}>{t('publishedContent')}</span>
                  </div>
                  <span className={cn(getTypographyClasses('h4'), 'text-green-600')}>
                    {publishedPosts}/{posts.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={getIconClasses('stats', 'banners')}>
                      <Image className="w-6 h-6 text-white" />
                    </div>
                    <span className={getTypographyClasses('small')}>{t('activePromotions')}</span>
                  </div>
                  <span className={cn(getTypographyClasses('h4'), 'text-teal-600')}>
                    {activeBanners}/{banners.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={getIconClasses('stats', 'products')}>
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <span className={getTypographyClasses('small')}>{t('productCatalog')}</span>
                  </div>
                  <span className={cn(getTypographyClasses('h4'), 'text-purple-600')}>
                    {products.length} {t('items')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={getCardClasses('base')}>
            <div className="p-6">
              <h3 className={getTypographyClasses('h3')}>{t('quickStatistics')}</h3>
              <p className={cn(getTypographyClasses('small'), 'mt-1 mb-4')}>
                {t('quickStatisticsDescription')}
              </p>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn(getTypographyClasses('small'), 'text-blue-700')}>{t('userGrowthRate')}</p>
                      <p className={cn(getTypographyClasses('h4'), 'text-blue-900')}>
                        {users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn(getTypographyClasses('small'), 'text-green-700')}>{t('contentPublished')}</p>
                      <p className={cn(getTypographyClasses('h4'), 'text-green-900')}>
                        {posts.length > 0 ? Math.round((publishedPosts / posts.length) * 100) : 0}%
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={cn(getTypographyClasses('small'), 'text-teal-700')}>{t('bannerActivity')}</p>
                      <p className={cn(getTypographyClasses('h4'), 'text-teal-900')}>
                        {banners.length > 0 ? Math.round((activeBanners / banners.length) * 100) : 0}%
                      </p>
                    </div>
                    <Image className="w-8 h-8 text-teal-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
