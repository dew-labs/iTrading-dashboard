import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { getTypographyClasses, cn } from '../../../utils/theme'

interface AnalyticsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  description: string
  trend?: {
    value: string
    isPositive: boolean
  }
  loading?: boolean
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  description,
  trend,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className={cn(getTypographyClasses('h4'), 'dark:text-white')}>
          {title}
        </h3>
        <Icon className={cn('w-5 h-5', iconColor)} />
      </div>
      
      <div className="space-y-2">
        <div className={cn(getTypographyClasses('large'), 'dark:text-white')}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        
        <div className="flex items-center justify-between">
          <p className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300')}>
            {description}
          </p>
          
          {trend && (
            <span className={cn(
              'text-sm font-medium',
              trend.isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}