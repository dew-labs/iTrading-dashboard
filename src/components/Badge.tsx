import React from 'react'
import {
  Shield,
  User,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  FileText,
  Calendar,
  Scale,
  Lock,
  Zap,
  Package,
  Sparkles
} from 'lucide-react'
import { cn } from '../utils/theme'
import { type BadgeVariant, getLabel, getBadgeStyle } from '../constants/general'

export type { BadgeVariant }
export type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  variant: BadgeVariant
  size?: BadgeSize
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
  icon?: React.ReactNode
}

const Badge: React.FC<BadgeProps> = ({
  variant,
  size = 'md',
  className,
  children,
  showIcon = false,
  icon
}) => {
  const getVariantStyles = (variant: BadgeVariant) => {
    const style = getBadgeStyle(variant)
    return `${style.background} ${style.text} ${style.border}`
  }

  const getVariantIcon = (variant: BadgeVariant) => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'

    switch (variant) {
    // User Roles
    case 'super_admin':
      return <Sparkles className={iconSize} />
    case 'admin':
      return <Shield className={iconSize} />
    case 'user':
      return <User className={iconSize} />

      // User Statuses
    case 'active':
      return <CheckCircle className={iconSize} />
    case 'inactive':
      return <XCircle className={iconSize} />
    case 'suspended':
      return <Lock className={iconSize} />
    case 'invited':
      return <UserPlus className={iconSize} />

      // Post Statuses
    case 'published':
      return <CheckCircle className={iconSize} />
    case 'draft':
      return <Clock className={iconSize} />

      // Post Types
    case 'news':
      return <FileText className={iconSize} />
    case 'event':
      return <Calendar className={iconSize} />
    case 'terms_of_use':
      return <Scale className={iconSize} />
    case 'privacy_policy':
      return <Lock className={iconSize} />

      // Product Types
    case 'subscription':
      return <Zap className={iconSize} />
    case 'one-time':
      return <Package className={iconSize} />

    default:
      return <User className={iconSize} />
    }
  }

  const getSizeStyles = (size: BadgeSize) => {
    switch (size) {
    case 'sm':
      return 'px-1.5 py-0.5 text-xs'
    case 'md':
      return 'px-2 py-1 text-xs'
    case 'lg':
      return 'px-3 py-1.5 text-sm'
    default:
      return 'px-2 py-1 text-xs'
    }
  }

  const displayIcon = icon || (showIcon ? getVariantIcon(variant) : null)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-colors',
        getVariantStyles(variant),
        getSizeStyles(size),
        className
      )}
    >
      {displayIcon && <span className='mr-1'>{displayIcon}</span>}
      {children || getLabel(variant)}
    </span>
  )
}

export default Badge
