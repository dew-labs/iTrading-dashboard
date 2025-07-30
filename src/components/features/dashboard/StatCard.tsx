import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '../../atoms'
import { getStatsCardProps, getIconClasses, getTypographyClasses, cn } from '../../../utils/theme'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  type: 'users' | 'posts' | 'products' | 'banners'
  badge?: {
    text: string
    variant?: 'active' | 'published' | 'draft' | 'inactive'
    showIcon?: boolean
  }
  trend?: {
    value: string
    isPositive: boolean
    description: string
  }
  loading?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  type,
  badge,
  trend,
  loading = false
}) => {
  const cardProps = getStatsCardProps(type)

  if (loading) {
    return (
      <div className={cardProps.cardClasses}>
        <div className="animate-pulse">
          <div className="flex items-center">
            <div className={cn(getIconClasses('stats', type), "bg-gray-200 dark:bg-gray-700")}>
              <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="ml-4 flex-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
          {badge && (
            <div className="mt-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
          )}
          {trend && (
            <div className="mt-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cardProps.cardClasses}>
      <div className="flex items-center">
        <div className={getIconClasses('stats', type)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <div className={cardProps.valueClasses}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className={cardProps.labelClasses}>{title}</div>
        </div>
      </div>
      
      {badge && (
        <div className="mt-4 flex items-center space-x-2">
          <Badge 
            variant={badge.variant || 'active'} 
            size="sm" 
            showIcon={badge.showIcon || false}
          >
            {badge.text}
          </Badge>
        </div>
      )}

      {trend && (
        <div className="mt-2 flex items-center space-x-2">
          <span className={cn(
            "text-sm font-medium",
            trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}
          </span>
          <span className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300')}>
            {trend.description}
          </span>
        </div>
      )}
    </div>
  )
}