/**
 * Form Validation Hook
 * Provides comprehensive form validation with real-time feedback
 */

import { useState, useCallback, useMemo } from 'react'
import { validateField, validateForm, type ValidationSchema, type FieldValidationResult } from '../utils/validation'
import { useTranslation } from './useTranslation'

export interface UseFormValidationOptions<T> {
  schema: ValidationSchema<T>
  validateOnBlur?: boolean
  validateOnChange?: boolean
  validateOnSubmit?: boolean
  initialData?: T
}

export interface FormValidationState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isValidating: boolean
  isValid: boolean
  isDirty: boolean
}

export interface FormValidationActions<T> {
  setData: (data: T) => void
  updateField: (field: keyof T, value: T[keyof T]) => void
  validateField: (field: keyof T) => FieldValidationResult
  validateForm: () => { isValid: boolean; errors: Partial<Record<keyof T, string>> }
  setFieldTouched: (field: keyof T, touched?: boolean) => void
  setError: (field: keyof T, error: string) => void
  clearError: (field: keyof T) => void
  clearErrors: () => void
  reset: (newData?: T) => void
  handleBlur: (field: keyof T) => (e: React.FocusEvent) => void
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleSubmit: (onSubmit: (data: T) => void | Promise<void>) => (e: React.FormEvent) => Promise<void>
}

export type UseFormValidationReturn<T> = FormValidationState<T> & FormValidationActions<T>

/**
 * Enhanced form validation hook with comprehensive features
 */
export function useFormValidation<T extends Record<string, any>>({
  schema,
  validateOnBlur = true,
  validateOnChange = false,
  validateOnSubmit = true,
  initialData
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const { t } = useTranslation()

  // Form state
  const [data, setDataState] = useState<T>(initialData || {} as T)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Computed values
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  const isDirty = useMemo(() => {
    if (!initialData) return Object.keys(data).length > 0
    return JSON.stringify(data) !== JSON.stringify(initialData)
  }, [data, initialData])

  // Actions
  const setData = useCallback((newData: T) => {
    setDataState(newData)
  }, [])

  const updateField = useCallback((field: keyof T, value: T[keyof T]) => {
    setDataState(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Validate on change if enabled
    if (validateOnChange) {
      const rule = schema[field]
      if (rule) {
        const result = validateField(value, rule, field as string, t)
        if (!result.isValid && result.error) {
          setErrors(prev => ({ ...prev, [field]: result.error }))
        }
      }
    }
  }, [schema, errors, validateOnChange, t])

  const validateFieldFn = useCallback((field: keyof T): FieldValidationResult => {
    const rule = schema[field]
    if (!rule) return { isValid: true }

    const result = validateField(data[field], rule, field as string, t)

    if (!result.isValid && result.error) {
      setErrors(prev => ({ ...prev, [field]: result.error }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    return result
  }, [data, schema, t])

  const validateFormFn = useCallback(() => {
    setIsValidating(true)

    const result = validateForm(data, schema, t)
    setErrors(result.errors)

    setIsValidating(false)
    return result
  }, [data, schema, t])

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }))
  }, [])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const reset = useCallback((newData?: T) => {
    const resetData = newData || initialData || {} as T
    setDataState(resetData)
    setErrors({})
    setTouched({})
    setIsValidating(false)
  }, [initialData])

  // Event handlers
    const handleBlur = useCallback((field: keyof T) => (_e: React.FocusEvent) => {
    setFieldTouched(field, true)

    if (validateOnBlur) {
      validateFieldFn(field)
    }
  }, [validateOnBlur, validateFieldFn, setFieldTouched])

  const handleChange = useCallback((field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { value, type, checked } = e.target as HTMLInputElement

    let fieldValue: T[keyof T]

    if (type === 'checkbox') {
      fieldValue = checked as T[keyof T]
    } else if (type === 'number') {
      fieldValue = (value === '' ? undefined : Number(value)) as T[keyof T]
    } else {
      fieldValue = value as T[keyof T]
    }

    updateField(field, fieldValue)
  }, [updateField])

  const handleSubmit = useCallback((onSubmit: (data: T) => void | Promise<void>) =>
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (validateOnSubmit) {
        const result = validateFormFn()
        if (!result.isValid) {
          // Mark all fields as touched to show errors
          const allTouched: Partial<Record<keyof T, boolean>> = {}
          Object.keys(schema).forEach(key => {
            allTouched[key as keyof T] = true
          })
          setTouched(allTouched)
          return
        }
      }

      setIsValidating(true)
      try {
        await onSubmit(data)
      } finally {
        setIsValidating(false)
      }
    }, [data, schema, validateOnSubmit, validateFormFn])

  return {
    // State
    data,
    errors,
    touched,
    isValidating,
    isValid,
    isDirty,

    // Actions
    setData,
    updateField,
    validateField: validateFieldFn,
    validateForm: validateFormFn,
    setFieldTouched,
    setError,
    clearError,
    clearErrors,
    reset,
    handleBlur,
    handleChange,
    handleSubmit
  }
}

/**
 * Helper hook for individual field validation
 */
export function useFieldValidation<T>(
  value: T,
  rule: import('../utils/validation').ValidationRule<T>,
  fieldName: string
) {
  const { t } = useTranslation()

  return useMemo(() => {
    return validateField(value, rule, fieldName, t)
  }, [value, rule, fieldName, t])
}

export default useFormValidation
