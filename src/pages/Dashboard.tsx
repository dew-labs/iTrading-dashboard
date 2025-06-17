import React from 'react';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Package,
  Eye,
  Calendar,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import Chart from '../components/Chart';

const Dashboard: React.FC = () => {
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
  ];

  const recentActivity = [
    { action: 'New user registered', user: 'Sarah Wilson', time: '2 minutes ago', type: 'user' },
    { action: 'Product updated', user: 'Mike Johnson', time: '15 minutes ago', type: 'product' },
    { action: 'News post published', user: 'Emma Davis', time: '1 hour ago', type: 'post' },
    { action: 'Banner activated', user: 'John Smith', time: '2 hours ago', type: 'banner' },
    { action: 'User account suspended', user: 'Admin', time: '3 hours ago', type: 'user' }
  ];

  const quickStats = [
    { label: 'Revenue', value: '$45,210', change: '+12.5%', positive: true },
    { label: 'Orders', value: '1,429', change: '+8.2%', positive: true },
    { label: 'Conversion', value: '3.24%', change: '-0.5%', positive: false },
    { label: 'Avg. Order', value: '$156', change: '+5.1%', positive: true },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 days
          </button>
          <button className="flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 transition-colors">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Reports
          </button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex items-center text-sm font-medium ${
                stat.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.positive ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
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
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-gray-600">Latest system activities</p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.type === 'user' ? 'bg-blue-500' :
                  activity.type === 'product' ? 'bg-purple-500' :
                  activity.type === 'post' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">by {activity.user}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-sm text-gray-900 hover:text-black font-medium">
            View all activity
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-gray-600">Frequently used actions and shortcuts</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all group">
            <FileText className="w-8 h-8 text-gray-400 group-hover:text-gray-900" />
            <div className="ml-3 text-left">
              <div className="font-medium text-gray-900 group-hover:text-gray-900">Create Post</div>
              <div className="text-sm text-gray-500">Add news or event</div>
            </div>
          </button>
          
          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all group">
            <Package className="w-8 h-8 text-gray-400 group-hover:text-gray-900" />
            <div className="ml-3 text-left">
              <div className="font-medium text-gray-900 group-hover:text-gray-900">Add Product</div>
              <div className="text-sm text-gray-500">Manage inventory</div>
            </div>
          </button>
          
          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all group">
            <Users className="w-8 h-8 text-gray-400 group-hover:text-gray-900" />
            <div className="ml-3 text-left">
              <div className="font-medium text-gray-900 group-hover:text-gray-900">Invite User</div>
              <div className="text-sm text-gray-500">Add team member</div>
            </div>
          </button>
          
          <button className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-all group">
            <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-gray-900" />
            <div className="ml-3 text-left">
              <div className="font-medium text-gray-900 group-hover:text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-500">Detailed reports</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;