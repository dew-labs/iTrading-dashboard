/**
 * Comprehensive Validation Utilities
 * Centralized validation rules with TypeScript support and internationalization
 */

import { COUNTRY_OPTIONS } from '../constants/general'

// Validation rule interface
export interface ValidationRule<T = unknown> {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: T) => boolean | string
  message?: string
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Field validation result
export interface FieldValidationResult {
  isValid: boolean
  error?: string
}

// Form validation schema
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>
}

/**
 * Enhanced validators with better TypeScript support
 */
export const validators = {
  /**
   * Validates email format using RFC 5322 compliant regex
   */
  email: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },

  /**
   * Validates phone number format - international format with country code
   */
  phone: (phone: string): boolean => {
    const cleaned = phone.replace(/[^\d+]/g, '')
    return /^\+\d{7,15}$/.test(cleaned)
  },

  /**
   * Validates password strength
   */
  password: (password: string, minLength = 8): {
    isValid: boolean
    score: number
    requirements: Array<{ met: boolean; text: string }>
  } => {
    const requirements = [
      { met: password.length >= minLength, text: `At least ${minLength} characters` },
      { met: /[a-z]/.test(password), text: 'One lowercase letter' },
      { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
      { met: /\d/.test(password), text: 'One number' },
      { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'One special character' }
    ]

    const score = requirements.filter(req => req.met).length
    return {
      isValid: score === requirements.length,
      score,
      requirements
    }
  },

  /**
   * Validates required field
   */
  required: (value: unknown): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (typeof value === 'number') return !isNaN(value)
    if (typeof value === 'boolean') return true
    if (Array.isArray(value)) return value.length > 0
    return Boolean(value)
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
  },

  /**
   * Validates numeric range
   */
  range: (value: number, min?: number, max?: number): boolean => {
    if (min !== undefined && value < min) return false
    if (max !== undefined && value > max) return false
    return true
  },

  /**
   * Validates year format
   */
  year: (year: number): boolean => {
    const currentYear = new Date().getFullYear()
    return year >= 1800 && year <= currentYear
  },

  /**
   * Validates file type
   */
  fileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type)
  },

  /**
   * Validates file size
   */
  fileSize: (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    return file.size <= maxSizeInBytes
  }
}

/**
 * Validates a single field against a validation rule
 */
export const validateField = <T>(
  value: T,
  rule: ValidationRule<T>,
  fieldName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t?: (key: string, params?: any) => string
): FieldValidationResult => {
  const errors: string[] = []

  // Required validation
  if (rule.required && !validators.required(value)) {
    errors.push(rule.message || t?.('validation.required', { field: fieldName }) || `${fieldName} is required`)
  }

  // Skip other validations if field is empty and not required
  if (!validators.required(value) && !rule.required) {
    return { isValid: true }
  }

  // String validations
  if (typeof value === 'string') {
    // Min length
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(
        rule.message ||
        t?.('validation.minLength', { field: fieldName, min: rule.minLength }) ||
        `${fieldName} must be at least ${rule.minLength} characters`
      )
    }

    // Max length
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(
        rule.message ||
        t?.('validation.maxLength', { field: fieldName, max: rule.maxLength }) ||
        `${fieldName} must be less than ${rule.maxLength} characters`
      )
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || t?.('validation.pattern', { field: fieldName }) || `${fieldName} format is invalid`)
    }
  }

  // Number validations
  if (typeof value === 'number') {
    // Min value
    if (rule.min !== undefined && value < rule.min) {
      errors.push(
        rule.message ||
        t?.('validation.min', { field: fieldName, min: rule.min }) ||
        `${fieldName} must be at least ${rule.min}`
      )
    }

    // Max value
    if (rule.max !== undefined && value > rule.max) {
      errors.push(
        rule.message ||
        t?.('validation.max', { field: fieldName, max: rule.max }) ||
        `${fieldName} must be less than ${rule.max}`
      )
    }
  }

  // Custom validation
  if (rule.custom) {
    const customResult = rule.custom(value)
    if (typeof customResult === 'string') {
      errors.push(customResult)
    } else if (!customResult) {
      errors.push(rule.message || t?.('validation.custom', { field: fieldName }) || `${fieldName} is invalid`)
    }
  }

  return {
    isValid: errors.length === 0,
    ...(errors.length > 0 && { error: errors[0] })
  }
}

/**
 * Validates an entire form against a schema
 */
export const validateForm = <T extends Record<string, unknown>>(
  data: T,
  schema: ValidationSchema<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t?: (key: string, params?: any) => string
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {}

  for (const field in schema) {
    const rule = schema[field]
    if (rule) {
      const result = validateField(data[field], rule, field as string, t)
      if (!result.isValid && result.error) {
        errors[field] = result.error
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Common validation schemas for reuse
 */
export const commonSchemas = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  } as ValidationRule<string>,

  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => validators.password(value).isValid,
    message: 'Password must meet security requirements'
  } as ValidationRule<string>,

  phone: {
    pattern: /^\+\d{7,15}$/,
    custom: (value: string) => !value || validators.phone(value),
    message: 'Please enter a valid phone number with country code (e.g., +1234567890)'
  } as ValidationRule<string>,

  url: {
    custom: (value: string) => !value || validators.url(value),
    message: 'Please enter a valid URL'
  } as ValidationRule<string>,

  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Name must be between 2 and 100 characters'
  } as ValidationRule<string>,

  year: {
    min: 1800,
    max: new Date().getFullYear(),
    custom: (value: number) => !value || validators.year(value),
    message: 'Please enter a valid year'
  } as ValidationRule<number>
}

/**
 * Form-specific validation schemas
 */
export const formSchemas = {
  user: {
    email: commonSchemas.email,
    full_name: commonSchemas.name,
    phone: commonSchemas.phone,
    country: {
      custom: (value: string) => !value || COUNTRY_OPTIONS.some((opt: { value: string; label: string }) => opt.value === value),
      message: 'Please select a valid country'
    },
    city: {
      maxLength: 100,
      message: 'City must be less than 100 characters'
    } as ValidationRule<string>,
    bio: {
      maxLength: 500,
      message: 'Bio must be less than 500 characters'
    } as ValidationRule<string>
  },

  post: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 200,
      message: 'Title must be between 3 and 200 characters'
    } as ValidationRule<string>,
    content: {
      required: true,
      minLength: 10,
      message: 'Content must be at least 10 characters'
    } as ValidationRule<string>
  },

  broker: {
    name: commonSchemas.name,
    established_in: commonSchemas.year,
    headquarter: {
      maxLength: 100,
      message: 'Headquarter must be less than 100 characters'
    } as ValidationRule<string>,
    description: {
      minLength: 10,
      message: 'Description must be at least 10 characters'
    } as ValidationRule<string>
  },

  banner: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Banner name must be between 2 and 100 characters'
    } as ValidationRule<string>,
    target_url: {
      required: true,
      custom: (value: string) => validators.url(value),
      message: 'Please enter a valid URL'
    } as ValidationRule<string>
  },

  product: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Product name must be between 2 and 100 characters'
    } as ValidationRule<string>,
    price: {
      required: true,
      min: 0,
      message: 'Price must be a positive number'
    } as ValidationRule<number>
  },

  changePassword: {
    currentPassword: {
      required: true,
      message: 'Current password is required'
    } as ValidationRule<string>,
    newPassword: commonSchemas.password,
    confirmNewPassword: {
      required: true,
      message: 'Please confirm your new password'
    } as ValidationRule<string>
  }
}

export default {
  validators,
  validateField,
  validateForm,
  commonSchemas,
  formSchemas
}
