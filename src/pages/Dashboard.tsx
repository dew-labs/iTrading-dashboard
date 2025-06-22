import React from 'react'
import {
  Users,
  FileText,
  Package,
  Eye,
  Calendar,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatsCard from '../components/StatsCard'
import Chart from '../components/Chart'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  const stats = [
    {
      title: 'Total Users',
      value: '12,543',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      title: 'Active Posts',
      value: '1,248',
      change: '+8%',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      title: 'Products',
      value: '892',
      change: '+15%',
      changeType: 'positive' as const,
      icon: Package,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Page Views',
      value: '89,432',
      change: '-3%',
      changeType: 'negative' as const,
      icon: Eye,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ]

  const recentActivity = [
    {
      action: 'New user registered',
      user: 'Sarah Wilson',
      time: '2 minutes ago',
      type: 'user'
    },
    {
      action: 'Product updated',
      user: 'Mike Johnson',
      time: '15 minutes ago',
      type: 'product'
    },
    {
      action: 'News post published',
      user: 'Emma Davis',
      time: '1 hour ago',
      type: 'post'
    },
    {
      action: 'Banner activated',
      user: 'John Smith',
      time: '2 hours ago',
      type: 'banner'
    },
    {
      action: 'User account suspended',
      user: 'Admin',
      time: '3 hours ago',
      type: 'user'
    }
  ]

  const quickStats = [
    { label: 'Revenue', value: '$45,210', change: '+12.5%', positive: true },
    { label: 'Orders', value: '1,429', change: '+8.2%', positive: true },
    { label: 'Conversion', value: '3.24%', change: '-0.5%', positive: false },
    { label: 'Avg. Order', value: '$156', change: '+5.1%', positive: true }
  ]

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Welcome back! Here's what's happening with your business today.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Last 30 days
              </button>
              <button className="flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors shadow-sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div
                    className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                      stat.positive
                        ? 'text-green-700 bg-green-100'
                        : 'text-red-700 bg-red-100'
                    }`}
                  >
                    {stat.positive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Charts and Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                  <p className="text-gray-600">Monthly revenue trends and performance</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-gray-900 to-black rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                </div>
              </div>
              <Chart />
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <p className="text-gray-600">Latest system activities</p>
                </div>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        activity.type === 'user'
                          ? 'bg-blue-500'
                          : activity.type === 'product'
                            ? 'bg-purple-500'
                            : activity.type === 'post'
                              ? 'bg-green-500'
                              : 'bg-orange-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.user}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                  View all activity
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600">Common tasks and shortcuts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/posts')}
                className="flex items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group border border-blue-200/50"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg mr-4 group-hover:scale-110 transition-transform shadow-sm">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Create Post</h4>
                  <p className="text-sm text-gray-600">Add new content</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/products')}
                className="flex items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all group border border-purple-200/50"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-lg mr-4 group-hover:scale-110 transition-transform shadow-sm">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Add Product</h4>
                  <p className="text-sm text-gray-600">Manage inventory</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/users')}
                className="flex items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all group border border-green-200/50"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-lg mr-4 group-hover:scale-110 transition-transform shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">Invite User</h4>
                  <p className="text-sm text-gray-600">Team management</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
