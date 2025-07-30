import React from 'react'
import { Activity, User, FileText, Package, Megaphone, Shield, AlertCircle } from 'lucide-react'
import { Badge } from '../../atoms'
import { getTypographyClasses, cn } from '../../../utils/theme'
import { useRecentActivity } from '../../../hooks/useRecentActivity'

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'users':
      return User
    case 'posts':
      return FileText
    case 'products':
      return Package
    case 'banners':
      return Megaphone
    case 'permissions':
    case 'role_permissions':
      return Shield
    default:
      return Activity
  }
}

const getActivityColor = (action: string) => {
  if (action.includes('created') || action.includes('inserted')) {
    return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
  } else if (action.includes('updated')) {
    return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20'
  } else if (action.includes('deleted')) {
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
  }
  return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
}

export const RecentActivityCard: React.FC = () => {
  const { recentActivity, loading, error, hasPermission } = useRecentActivity()

  if (!hasPermission) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={cn(getTypographyClasses('description'), 'text-gray-500')}>
            You don't have permission to view recent activity
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h3 className={cn(getTypographyClasses('h3'), 'dark:text-white')}>Recent Activity</h3>
          <p className={getTypographyClasses('description')}>Latest system actions and changes</p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className={cn(getTypographyClasses('description'), 'text-red-500')}>
            Failed to load recent activity
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h3 className={cn(getTypographyClasses('h3'), 'dark:text-white')}>Recent Activity</h3>
        <p className={getTypographyClasses('description')}>Latest system actions and changes</p>
      </div>

      {recentActivity.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className={cn(getTypographyClasses('description'), 'text-gray-500')}>
            No recent activity found
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentActivity.map((activity) => {
            const IconComponent = getActivityIcon(activity.type)
            const colorClasses = getActivityColor(activity.action)
            
            return (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  colorClasses
                )}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className={cn(getTypographyClasses('small'), 'font-medium dark:text-white')}>
                      {activity.action}
                    </p>
                    {activity.details && (
                      <Badge variant="active" size="sm">
                        {activity.details}
                      </Badge>
                    )}
                  </div>
                  <p className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300')}>
                    by {activity.user}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={cn(getTypographyClasses('small'), 'text-gray-500')}>
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}