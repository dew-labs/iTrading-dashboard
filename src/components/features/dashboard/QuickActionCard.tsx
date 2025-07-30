import React from 'react'
import { type LucideIcon, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getButtonClasses, getTypographyClasses, cn } from '../../../utils/theme'

interface QuickActionCardProps {
  title: string
  description: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange'
  path: string
  permission?: boolean
  onClick?: () => void
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  color,
  path,
  permission = true,
  onClick
}) => {
  const navigate = useNavigate()

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

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(path)
    }
  }

  if (!permission) {
    return (
      <div className={cn(
        'p-6 rounded-xl border transition-all duration-200 opacity-50 cursor-not-allowed',
        'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
      )}>
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <h3 className={cn(getTypographyClasses('h4'), 'mb-2', 'text-gray-500 dark:text-gray-400')}>
          {title}
        </h3>
        <p className={cn(getTypographyClasses('small'), 'text-gray-400 dark:text-gray-500 mb-4')}>
          {description}
        </p>
        <button
          className={cn(getButtonClasses('secondary', 'sm'), 'w-full')}
          disabled
        >
          <Plus className="w-4 h-4 mr-2" />
          No Permission
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'p-6 rounded-xl transition-all duration-200 hover:shadow-md cursor-pointer group',
        getCardStyles(color)
      )}
      onClick={handleClick}
    >
      <div className="flex items-center mb-4">
        <div className={getIconStyles(color)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <h3 className={cn(getTypographyClasses('h4'), 'mb-2', 'dark:text-white')}>
        {title}
      </h3>
      <p className={cn(getTypographyClasses('small'), 'text-gray-600 dark:text-gray-300 mb-4')}>
        {description}
      </p>
      <button className={cn(getButtonClasses('primary', 'sm'), 'w-full')}>
        <Plus className="w-4 h-4 mr-2" />
        Create
      </button>
    </div>
  )
}
