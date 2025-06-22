/**
 * Utilities Index
 * Centralized exports for all utility functions
 */

// Theme utilities
export * from './theme'
export { default as themeUtils } from './theme'

// Format utilities
export * from './format'
export { default as formatUtils } from './format'

// Re-export commonly used functions for convenience
export {
  // Theme utilities
  cn,
  getPageLayoutClasses,
  getButtonClasses,
  getStatsCardProps,
  getRoleBadge,
  getStatusBadge,
  getTypeBadge,
  getIconClasses,
  getTypographyClasses,
  getCardClasses,
  getContainerClasses
} from './theme'

export {
  // Format utilities
  formatDate,
  formatDateDisplay,
  formatDateLong,
  formatCurrency,
  formatPercent,
  formatNumber,
  formatRoleLabel,
  formatTypeLabel,
  formatStatusLabel,
  formatFileSize,
  formatRelativeTime
} from './format'
