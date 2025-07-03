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

// Toast utilities
export * from './toast'
export { default as toast } from './toast'

// Text utilities
export * from './textUtils'

// Re-export commonly used functions for convenience
export {
  // Theme utilities
  cn,
  getPageLayoutClasses,
  getButtonClasses,
  getStatsCardProps,
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

// Error handling utilities
export * from './errorHandler'
export { default as errorHandler } from './errorHandler'

// Performance monitoring utilities
export * from './performanceMonitor'
export { default as performanceMonitor } from './performanceMonitor'

export * from './groupImages'
