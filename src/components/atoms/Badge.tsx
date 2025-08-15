import React from 'react'
import {
  User,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  FileText,
  Calendar,
  Scale,
  Lock,
  Gavel,
  Shield,
  HandCoins
} from 'lucide-react'
import { cn } from '../../utils/theme'
import { type BadgeVariant, getLabel, getBadgeStyle } from '../../constants/general'
import { BADGE_SIZES, ICON_SIZES, type BadgeSize } from '../../constants/ui'
import { useTranslation } from '../../hooks/useTranslation'

export type { BadgeVariant, BadgeSize }

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
  size = BADGE_SIZES.MD,
  className,
  children,
  showIcon = false,
  icon
}) => {
  const { t } = useTranslation()

  const getVariantStyles = (variant: BadgeVariant) => {
    const style = getBadgeStyle(variant)
    return `${style.background} ${style.text} ${style.border}`
  }

  const getVariantIcon = (variant: BadgeVariant) => {
    const iconSize = size === BADGE_SIZES.SM ? ICON_SIZES.XS : size === BADGE_SIZES.LG ? ICON_SIZES.SM : ICON_SIZES.XS

    switch (variant) {
    // User Roles
    case 'moderator':
      return <Gavel className={iconSize} aria-label={t('ui.accessibility.moderator')} />
    case 'admin':
      return <Shield className={iconSize} aria-label={t('ui.accessibility.admin')} />
    case 'user':
      return <User className={iconSize} aria-label={t('ui.accessibility.user')} />
    case 'affiliate':
      return <HandCoins className={iconSize} aria-label='Affiliate' />

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

      // Generic variants
    case 'secondary':
      return null // No default icon for secondary variant

      // Product Types
    default:
      return <User className={iconSize} />
    }
  }

  const getSizeStyles = (size: BadgeSize) => {
    switch (size) {
    case BADGE_SIZES.SM:
      return 'px-1.5 py-0.5 text-xs'
    case BADGE_SIZES.MD:
      return 'px-2 py-1 text-xs'
    case BADGE_SIZES.LG:
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
