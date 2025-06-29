// Brokers Feature - Utility Functions

/**
 * Calculate broker rating display
 */
export const formatBrokerRating = (rating: number | null): string => {
  if (!rating) return 'Not rated'
  return `${rating.toFixed(1)}/5.0`
}

/**
 * Get broker status badge variant
 */
export const getBrokerStatusVariant = (isActive: boolean) => {
  return isActive ? 'success' : 'gray'
}

/**
 * Format broker established year
 */
export const formatEstablishedYear = (year: number | null): string => {
  if (!year) return 'Unknown'
  return `Est. ${year}`
}
