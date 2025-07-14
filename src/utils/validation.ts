/**
 * Comprehensive Validation Utilities
 * Centralized validation rules with TypeScript support and internationalization
 */

import { COUNTRY_OPTIONS } from '../constants/general'
import { VALIDATION } from '../constants/ui'
import type { TOptions } from 'i18next'

/**
 * Validation types and interfaces
 */
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

export interface FieldValidationResult {
  isValid: boolean
  error?: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string>
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
    return VALIDATION.EMAIL_REGEX.test(email)
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
  password: (password: string, minLength = VALIDATION.PASSWORD_MIN_LENGTH): {
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
 * Get a user-friendly field label for validation messages
 */
const getFieldLabel = (fieldName: string, t?: (key: string, params?: Record<string, unknown>) => string): string => {
  if (!t) return fieldName

  // Try to get field label from forms namespace
  const labelKey = `labels.${fieldName}`
  try {
    const label = t(labelKey, { defaultValue: labelKey })
    if (label !== labelKey) {
      return label
    }
  } catch {
    // Fall back to field name processing
  }

  // Convert field names to readable labels
  const fieldLabelMap: Record<string, string> = {
    'established_in': 'Established Year',
    'full_name': 'Full Name',
    'phone': 'Phone Number',
    'target_url': 'Target URL',
    'featured_image_url': 'Featured Image URL',
    'is_visible': 'Visibility',
    'is_active': 'Active Status',
    'currentPassword': 'Current Password',
    'newPassword': 'New Password',
    'confirmNewPassword': 'Confirm New Password',
    'confirmPassword': 'Confirm Password'
  }

  if (fieldLabelMap[fieldName]) {
    return fieldLabelMap[fieldName]
  }

  // Convert snake_case to Title Case
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Validates a single field against a validation rule
 */
export const validateField = <T>(
  value: T,
  rule: ValidationRule<T>,
  fieldName: string,
  t?: (key: string, options?: TOptions) => string
): FieldValidationResult => {
  const errors: string[] = []
  const fieldLabel = getFieldLabel(fieldName, t)

  // Required validation
  if (rule.required && !validators.required(value)) {
    // Try specific field validation message first, then fall back to generic
    const specificKey = `validation.${fieldName}`
    const genericKey = 'validation.required'

    if (rule.message) {
      errors.push(rule.message)
    } else if (t) {
      // Try specific field message first
      try {
        const specificMessageCheck = t(specificKey, { field: fieldLabel, defaultValue: specificKey })
        if (specificMessageCheck !== specificKey && !specificMessageCheck.includes('{{')) {
          errors.push(specificMessageCheck)
        } else {
          errors.push(t(genericKey, { field: fieldLabel }))
        }
      } catch {
        errors.push(t(genericKey, { field: fieldLabel }))
      }
    } else {
      errors.push(`${fieldLabel} is required`)
    }
  }

  // Skip other validations if field is empty and not required
  if (!validators.required(value) && !rule.required) {
    return { isValid: true }
  }

  // String validations
  if (typeof value === 'string') {
    // Min length
    if (rule.minLength && value.length < rule.minLength) {
      const specificKey = `validation.${fieldName}`
      const genericKey = 'validation.minLength'

      if (rule.message) {
        errors.push(rule.message)
      } else if (t) {
        try {
          // Try specific field message first (without interpolation to check if it exists)
          const specificMessageCheck = t(specificKey, { field: fieldLabel, min: rule.minLength, max: rule.maxLength, defaultValue: specificKey })
          if (specificMessageCheck !== specificKey && !specificMessageCheck.includes('{{')) {
            errors.push(specificMessageCheck)
          } else {
            errors.push(t(genericKey, { field: fieldLabel, min: rule.minLength }))
          }
        } catch {
          errors.push(t(genericKey, { field: fieldLabel, min: rule.minLength }))
        }
      } else {
        errors.push(`${fieldLabel} must be at least ${rule.minLength} characters`)
      }
    }

    // Max length
    if (rule.maxLength && value.length > rule.maxLength) {
      const specificKey = `validation.${fieldName}`
      const genericKey = 'validation.maxLength'

      if (rule.message) {
        errors.push(rule.message)
      } else if (t) {
        try {
          // Try specific field message first (without interpolation to check if it exists)
          const specificMessageCheck = t(specificKey, { field: fieldLabel, min: rule.minLength, max: rule.maxLength, defaultValue: specificKey })
          if (specificMessageCheck !== specificKey && !specificMessageCheck.includes('{{')) {
            errors.push(specificMessageCheck)
          } else {
            errors.push(t(genericKey, { field: fieldLabel, max: rule.maxLength }))
          }
        } catch {
          errors.push(t(genericKey, { field: fieldLabel, max: rule.maxLength }))
        }
      } else {
        errors.push(`${fieldLabel} must be less than ${rule.maxLength} characters`)
      }
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      const specificKey = `validation.${fieldName}`
      const genericKey = 'validation.pattern'

      if (rule.message) {
        errors.push(rule.message)
      } else if (t) {
        try {
          const specificMessageCheck = t(specificKey, { field: fieldLabel, defaultValue: specificKey })
          if (specificMessageCheck !== specificKey && !specificMessageCheck.includes('{{')) {
            errors.push(specificMessageCheck)
          } else {
            errors.push(t(genericKey, { field: fieldLabel }))
          }
        } catch {
          errors.push(t(genericKey, { field: fieldLabel }))
        }
      } else {
        errors.push(`${fieldLabel} format is invalid`)
      }
    }
  }

  // Number validations
  if (typeof value === 'number') {
    // Min value
    if (rule.min !== undefined && value < rule.min) {
      const specificKey = `validation.${fieldName}`
      const genericKey = 'validation.min'

      if (rule.message) {
        errors.push(rule.message)
      } else if (t) {
        try {
          // Try specific field message first (without interpolation to check if it exists)
          const specificMessageCheck = t(specificKey, { field: fieldLabel, min: rule.min, max: rule.max, defaultValue: specificKey })
          if (specificMessageCheck !== specificKey && !specificMessageCheck.includes('{{')) {
            errors.push(specificMessageCheck)
          } else {
            errors.push(t(genericKey, { field: fieldLabel, min: rule.min }))
          }
        } catch {
          errors.push(t(genericKey, { field: fieldLabel, min: rule.min }))
        }
      } else {
        errors.push(`${fieldLabel} must be at least ${rule.min}`)
      }
    }

    // Max value
    if (rule.max !== undefined && value > rule.max) {
      const specificKey = `validation.${fieldName}`
      const genericKey = 'validation.max'

      if (rule.message) {
        errors.push(rule.message)
      } else if (t) {
        try {
          // Try specific field message first (without interpolation to check if it exists)
          const specificMessageCheck = t(specificKey, { field: fieldLabel, min: rule.min, max: rule.max, defaultValue: specificKey })
          if (specificMessageCheck !== specificKey && !specificMessageCheck.includes('{{')) {
            errors.push(specificMessageCheck)
          } else {
            errors.push(t(genericKey, { field: fieldLabel, max: rule.max }))
          }
        } catch {
          errors.push(t(genericKey, { field: fieldLabel, max: rule.max }))
        }
      } else {
        errors.push(`${fieldLabel} must be less than ${rule.max}`)
      }
    }
  }

  // Custom validation
  if (rule.custom) {
    const customResult = rule.custom(value)
    if (typeof customResult === 'string') {
      errors.push(customResult)
    } else if (!customResult) {
      const specificKey = `validation.${fieldName}`
      const genericKey = 'validation.custom'

      if (rule.message) {
        errors.push(rule.message)
      } else if (t) {
        try {
          const specificMessageCheck = t(specificKey, { field: fieldLabel, defaultValue: specificKey })
          if (specificMessageCheck !== specificKey && !specificMessageCheck.includes('{{')) {
            errors.push(specificMessageCheck)
          } else {
            errors.push(t(genericKey, { field: fieldLabel }))
          }
        } catch {
          errors.push(t(genericKey, { field: fieldLabel }))
        }
      } else {
        errors.push(`${fieldLabel} is invalid`)
      }
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
  t?: (key: string, options?: TOptions) => string
): FormValidationResult => {
  const errors: Record<string, string> = {}

  for (const field in schema) {
    const rule = schema[field]
    if (rule) {
      const result = validateField(data[field], rule, field as string, t)
      if (!result.isValid && result.error) {
        errors[field as string] = result.error
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
    pattern: VALIDATION.EMAIL_REGEX
  } as ValidationRule<string>,

  password: {
    required: true,
    minLength: VALIDATION.PASSWORD_MIN_LENGTH,
    custom: (value: string) => validators.password(value).isValid
  } as ValidationRule<string>,

  phone: {
    pattern: VALIDATION.PHONE_REGEX,
    custom: (value: string) => !value || validators.phone(value)
  } as ValidationRule<string>,

  url: {
    custom: (value: string) => !value || validators.url(value)
  } as ValidationRule<string>,

  name: {
    required: true,
    minLength: VALIDATION.NAME_MIN_LENGTH,
    maxLength: VALIDATION.NAME_MAX_LENGTH
  } as ValidationRule<string>,

  year: {
    min: VALIDATION.YEAR_MIN,
    max: VALIDATION.YEAR_MAX,
    custom: (value: number) => !value || validators.year(value)
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
      custom: (value: string) => !value || COUNTRY_OPTIONS.some((opt: { value: string; label: string }) => opt.value === value)
    },
    city: {
      maxLength: VALIDATION.CITY_MAX_LENGTH
    } as ValidationRule<string>,
    bio: {
      maxLength: VALIDATION.BIO_MAX_LENGTH
    } as ValidationRule<string>,
    role: { required: true } as ValidationRule<string>
  },

  post: {
    title: {
      required: true,
      minLength: VALIDATION.TITLE_MIN_LENGTH,
      maxLength: VALIDATION.TITLE_MAX_LENGTH
    } as ValidationRule<string>,
    content: {
      required: true,
      minLength: VALIDATION.CONTENT_MIN_LENGTH
    } as ValidationRule<string>
  },

  broker: {
    name: commonSchemas.name,
    established_in: commonSchemas.year,
    headquarter: {
      maxLength: VALIDATION.HEADQUARTER_MAX_LENGTH
    } as ValidationRule<string>,
    description: {
      minLength: VALIDATION.DESCRIPTION_MIN_LENGTH
    } as ValidationRule<string>
  },

  banner: {
    name: {
      required: true,
      minLength: VALIDATION.BANNER_NAME_MIN_LENGTH,
      maxLength: VALIDATION.BANNER_NAME_MAX_LENGTH
    } as ValidationRule<string>,
    target_url: {
      required: true,
      custom: (value: string) => validators.url(value)
    } as ValidationRule<string>
  },

  product: {
    name: {
      required: true,
      minLength: VALIDATION.REQUIRED_FIELD_MIN_LENGTH,
      maxLength: VALIDATION.REQUIRED_FIELD_MAX_LENGTH
    } as ValidationRule<string>,
    price: {
      required: true,
      min: VALIDATION.PRICE_MIN
    } as ValidationRule<number>
  },

  changePassword: {
    currentPassword: {
      required: true
    } as ValidationRule<string>,
    newPassword: commonSchemas.password,
    confirmNewPassword: {
      required: true
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
