import React from 'react'
import { BarChart3, TrendingUp, Activity, Users, Package, FileText, Image, DollarSign } from 'lucide-react'
import {
  getPageLayoutClasses,
  getStatsCardProps,
  getIconClasses,
  getTypographyClasses,
  getCardClasses,
  cn
} from '../utils/theme'

const Analytics: React.FC = () => {
  const layout = getPageLayoutClasses()

  // Mock analytics data
  const analyticsData = {
    totalUsers: 1247,
    totalProducts: 156,
    totalPosts: 89,
    totalBanners: 24,
    revenue: 52400,
    growth: 12.5,
    activeUsers: 892,
    conversionRate: 3.2
  }

  const userStatsProps = getStatsCardProps('users')
  const productStatsProps = getStatsCardProps('products')
  const postStatsProps = getStatsCardProps('posts')
  const bannerStatsProps = getStatsCardProps('banners')

  return (
    <div className={layout.container}>
      <div className="space-y-6">
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>Analytics Dashboard</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              Track your performance metrics and key insights
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className={layout.grid}>
          <div className={userStatsProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'users')}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={userStatsProps.valueClasses}>{analyticsData.totalUsers.toLocaleString()}</div>
                <div className={userStatsProps.labelClasses}>Total Users</div>
                <div className={cn(getTypographyClasses('xs'), 'text-green-600 mt-1')}>
                  +{analyticsData.growth}% this month
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
                <div className={productStatsProps.valueClasses}>{analyticsData.totalProducts}</div>
                <div className={productStatsProps.labelClasses}>Products</div>
                <div className={cn(getTypographyClasses('xs'), 'text-purple-600 mt-1')}>
                  Active catalog
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
                <div className={postStatsProps.valueClasses}>{analyticsData.totalPosts}</div>
                <div className={postStatsProps.labelClasses}>Content Posts</div>
                <div className={cn(getTypographyClasses('xs'), 'text-green-600 mt-1')}>
                  Published content
                </div>
              </div>
            </div>
          </div>

          <div className={bannerStatsProps.cardClasses}>
            <div className="flex items-center">
              <div className={getIconClasses('stats', 'banners')}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <div className={bannerStatsProps.valueClasses}>${analyticsData.revenue.toLocaleString()}</div>
                <div className={bannerStatsProps.labelClasses}>Revenue</div>
                <div className={cn(getTypographyClasses('xs'), 'text-teal-600 mt-1')}>
                  This quarter
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Overview */}
          <div className={getCardClasses('base')}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={getTypographyClasses('h3')}>Performance Overview</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={getTypographyClasses('small')}>Active Users</p>
                      <p className={cn(getTypographyClasses('h4'), 'text-blue-900')}>
                        {analyticsData.activeUsers.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-green-500 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">+5.2%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={getTypographyClasses('small')}>Conversion Rate</p>
                      <p className={cn(getTypographyClasses('h4'), 'text-green-900')}>
                        {analyticsData.conversionRate}%
                      </p>
                    </div>
                  </div>
                  <div className="text-green-500 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">+1.8%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={getTypographyClasses('small')}>Engagement Rate</p>
                      <p className={cn(getTypographyClasses('h4'), 'text-purple-900')}>
                        68.4%
                      </p>
                    </div>
                  </div>
                  <div className="text-green-500 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">+3.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={getCardClasses('base')}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className={getTypographyClasses('h3')}>Recent Activity</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className={cn(getTypographyClasses('small'), 'font-medium')}>
                      New user registration spike
                    </p>
                    <p className={cn(getTypographyClasses('xs'), 'text-gray-500')}>
                      +24 new users in the last hour
                    </p>
                    <p className={cn(getTypographyClasses('xs'), 'text-gray-400')}>
                      2 minutes ago
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className={cn(getTypographyClasses('small'), 'font-medium')}>
                      High engagement on latest post
                    </p>
                    <p className={cn(getTypographyClasses('xs'), 'text-gray-500')}>
                      125% above average interaction
                    </p>
                    <p className={cn(getTypographyClasses('xs'), 'text-gray-400')}>
                      15 minutes ago
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <Image className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className={cn(getTypographyClasses('small'), 'font-medium')}>
                      Banner campaign performing well
                    </p>
                    <p className={cn(getTypographyClasses('xs'), 'text-gray-500')}>
                      CTR increased by 18%
                    </p>
                    <p className={cn(getTypographyClasses('xs'), 'text-gray-400')}>
                      1 hour ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className={getCardClasses('base')}>
          <div className="p-8 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>
              Advanced Analytics Coming Soon
            </h3>
            <p className={getTypographyClasses('description')}>
              We're working on more detailed charts and insights to help you make better decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
