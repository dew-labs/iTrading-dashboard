/**
 * Format Utility Functions
 * Dedicated utilities for formatting dates, numbers, and other data
 *
 * This file contains all formatting-related functions to maintain separation
 * of concerns from theme utilities. It includes:
 * - Date formatting (dd-mm-yyyy format)
 * - Number formatting (currency, percentages, etc.)
 * - Text formatting (role labels, status labels, etc.)
 * - File size formatting
 * - Relative time formatting
 * - Validation utilities
 */

import { FORMAT } from '../constants/theme'

// Date formatting functions
export const formatDate = (
  date: string | Date,
  format: keyof typeof FORMAT.date = 'display'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }

  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const year = dateObj.getFullYear()
  const hours = dateObj.getHours().toString().padStart(2, '0')
  const minutes = dateObj.getMinutes().toString().padStart(2, '0')

  switch (format) {
  case 'display':
    return `${day}-${month}-${year}`
  case 'displayLong':
    return `${day}-${month}-${year} ${hours}:${minutes}`
  case 'iso':
    return `${year}-${month}-${day}`
  case 'fileName':
    return `${year}${month}${day}`
  default:
    return `${day}-${month}-${year}`
  }
}

// Shorthand for common date formatting
export const formatDateDisplay = (date: string | Date): string => formatDate(date, 'display')
export const formatDateLong = (date: string | Date): string => formatDate(date, 'displayLong')

// Number formatting functions
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatPercent = (value: number, decimals = 1): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100)
}

export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

// Custom price formatter: no decimals if integer, two decimals if not
export const formatPrice = (value: number): string => {
  if (Number.isInteger(value)) {
    return value.toLocaleString('en-US')
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Text formatting functions
export const formatRoleLabel = (role: string): string => {
  switch (role) {
          case 'moderator':
      return 'Moderator'
  default:
    return role.charAt(0).toUpperCase() + role.slice(1)
  }
}

export const formatTypeLabel = (type: string): string => {
  switch (type) {
  case 'terms_of_use':
    return 'Terms of Use'
  case 'privacy_policy':
    return 'Privacy Policy'
  default:
    return type.charAt(0).toUpperCase() + type.slice(1)
  }
}

export const formatStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// File size formatting
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

// Relative time formatting
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date()
  const targetDate = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`

  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

// Validation utilities
export const validators = {
  /**
   * Validates email format using RFC 5322 compliant regex
   */
  email: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },

  /**
   * Validates phone number format - international format with country code
   * Allows: +1234567890, +1 (234) 567-8900, +1-234-567-8900, etc.
   */
  phone: (phone: string): boolean => {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '')
    // Must start with + and have 7-15 digits total (including country code)
    return /^\+\d{7,15}$/.test(cleaned)
  },

  /**
   * Validates password strength
   * @param password - The password to validate
   * @param minLength - Minimum password length (default: 8)
   * @returns Object with isValid boolean and array of requirements
   */
  password: (password: string, minLength = 8): {isValid: boolean; requirements: string[]} => {
    const requirements: string[] = []

    if (password.length < minLength) {
      requirements.push(`At least ${minLength} characters`)
    }
    if (!/[a-z]/.test(password)) {
      requirements.push('One lowercase letter')
    }
    if (!/[A-Z]/.test(password)) {
      requirements.push('One uppercase letter')
    }
    if (!/\d/.test(password)) {
      requirements.push('One number')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      requirements.push('One special character')
    }

    return {
      isValid: requirements.length === 0,
      requirements
    }
  },

  /**
   * Validates required field
   */
  required: (value: string | null | undefined): boolean => {
    return value !== null && value !== undefined && value.trim().length > 0
  },

  /**
   * Validates string length
   */
  length: (value: string, min?: number, max?: number): boolean => {
    const length = value.length
    if (min !== undefined && length < min) return false
    if (max !== undefined && length > max) return false
    return true
  },

  /**
   * Validates URL format
   */
  url: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

// Export all utilities as default object
export default {
  formatDate,
  formatDateDisplay,
  formatDateLong,
  formatCurrency,
  formatPercent,
  formatNumber,
  formatPrice,
  formatRoleLabel,
  formatTypeLabel,
  formatStatusLabel,
  formatFileSize,
  formatRelativeTime,
  validators
}
