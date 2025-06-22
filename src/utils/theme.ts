/**
 * Theme Utility Functions
 * Enhanced helper functions for working with the improved theme system
 */

import {
  BADGE_VARIANTS,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  CARD_VARIANTS,
  LAYOUT_VARIANTS,
  TYPOGRAPHY_VARIANTS,
  ICON_VARIANTS
} from '../constants/components'
import { CONTAINER, COMPONENT_SPACING } from '../constants/spacing'
import { TIME } from '../constants/theme'

// Utility function to combine CSS classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Get status badge classes (optimized with pre-computed styles)
export const getStatusBadge = (status: string): string => {
  return BADGE_VARIANTS.status[status as keyof typeof BADGE_VARIANTS.status] || BADGE_VARIANTS.status.inactive
}

// Get role badge classes
export const getRoleBadge = (role: string): string => {
  return BADGE_VARIANTS.role[role as keyof typeof BADGE_VARIANTS.role] || BADGE_VARIANTS.role.user
}

// Get type badge classes
export const getTypeBadge = (type: string): string => {
  return BADGE_VARIANTS.type[type as keyof typeof BADGE_VARIANTS.type] || BADGE_VARIANTS.status.inactive
}

// Get button classes with variant and size
export const getButtonClasses = (
  variant: keyof typeof BUTTON_VARIANTS = 'primary',
  size: keyof typeof BUTTON_SIZES = 'md'
): string => {
  return cn(BUTTON_VARIANTS[variant], BUTTON_SIZES[size])
}

// Get card classes
export const getCardClasses = (variant: keyof typeof CARD_VARIANTS = 'stats'): string => {
  return CARD_VARIANTS[variant]
}

// Get container classes
export const getContainerClasses = (
  width: keyof typeof CONTAINER.maxWidth = 'xl',
  padding: keyof typeof CONTAINER.padding = 'desktop',
  section: keyof typeof CONTAINER.section = 'normal'
): string => {
  return cn(
    'min-h-full bg-gray-50',
    CONTAINER.maxWidth[width],
    'mx-auto',
    CONTAINER.padding[padding],
    CONTAINER.section[section]
  )
}

// Get page layout classes
export const getPageLayoutClasses = () => ({
  container: getContainerClasses(),
  header: LAYOUT_VARIANTS.page.header,
  grid: cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', COMPONENT_SPACING.grid.gap.comfortable)
})

// Get typography classes
export const getTypographyClasses = (
  variant: keyof typeof TYPOGRAPHY_VARIANTS.heading | keyof typeof TYPOGRAPHY_VARIANTS.body | 'subtitle' | 'description' | 'muted' | 'caption'
): string => {
  if (variant in TYPOGRAPHY_VARIANTS.heading) {
    return TYPOGRAPHY_VARIANTS.heading[variant as keyof typeof TYPOGRAPHY_VARIANTS.heading]
  }

  if (variant in TYPOGRAPHY_VARIANTS.body) {
    return TYPOGRAPHY_VARIANTS.body[variant as keyof typeof TYPOGRAPHY_VARIANTS.body]
  }

  return TYPOGRAPHY_VARIANTS[variant as 'subtitle' | 'description' | 'muted' | 'caption']
}

// Get icon classes
export const getIconClasses = (
  variant: keyof typeof ICON_VARIANTS = 'action',
  type?: keyof typeof ICON_VARIANTS.stats
): string => {
  if (variant === 'stats' && type) {
    return ICON_VARIANTS.stats[type]
  }

  if (variant in ICON_VARIANTS && typeof ICON_VARIANTS[variant] === 'string') {
    return ICON_VARIANTS[variant] as string
  }

  return ICON_VARIANTS.action
}

// Enhanced responsive grid helper
export const getResponsiveGridClasses = (config: {
  cols?: { sm?: number; md?: number; lg?: number; xl?: number }
  gap?: keyof typeof COMPONENT_SPACING.grid.gap
} = {}): string => {
  const { cols = { sm: 1, md: 2, lg: 3, xl: 4 }, gap = 'comfortable' } = config

  const gridClasses = [
    `grid grid-cols-${cols.sm || 1}`,
    cols.md && cols.md > 1 ? `sm:grid-cols-${cols.md}` : null,
    cols.lg && cols.lg > 1 ? `md:grid-cols-${cols.lg}` : null,
    cols.xl && cols.xl > 1 ? `lg:grid-cols-${cols.xl}` : null,
    COMPONENT_SPACING.grid.gap[gap]
  ]

  return cn(...gridClasses)
}

// Enhanced debounce function
export const createDebounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: keyof typeof TIME.debounce = 'input'
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), TIME.debounce[delay])
  }
}

// Theme-aware search debounce (commonly used)
export const createSearchDebounce = <T extends (...args: unknown[]) => unknown>(func: T) => {
  return createDebounce(func, 'search')
}

// Pagination helper
export const getPaginationInfo = (
  currentPage: number,
  itemsPerPage: number,
  totalItems: number
) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    startItem,
    endItem,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  }
}

// Stats card helper
export const getStatsCardProps = (feature: keyof typeof ICON_VARIANTS.stats) => ({
  cardClasses: getCardClasses('stats'),
  iconClasses: getIconClasses('stats', feature),
  titleClasses: getTypographyClasses('h4'),
  valueClasses: 'text-2xl font-bold text-gray-900',
  labelClasses: cn(getTypographyClasses('small'), 'font-medium')
})

// Export all utilities as default object
export default {
  cn,
  getStatusBadge,
  getRoleBadge,
  getTypeBadge,
  getButtonClasses,
  getCardClasses,
  getContainerClasses,
  getPageLayoutClasses,
  getTypographyClasses,
  getIconClasses,
  getResponsiveGridClasses,
  createDebounce,
  createSearchDebounce,
  getPaginationInfo,
  getStatsCardProps
}
