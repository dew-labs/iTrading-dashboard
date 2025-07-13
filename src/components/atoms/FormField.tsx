/**
 * Enhanced Form Field Component
 * Provides comprehensive form field with validation integration
 */

import React from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { cn } from '../../utils/theme'
import { useTranslation } from '../../hooks/useTranslation'

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  isPasswordField?: boolean
  showPasswordToggle?: boolean
  containerClassName?: string
  labelClassName?: string
  inputClassName?: string
  errorClassName?: string
  helperClassName?: string
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(({
  label,
  error,
  helperText,
  required,
  icon,
  size = 'md',
  variant = 'default',
  isPasswordField = false,
  showPasswordToggle = false,
  containerClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  helperClassName,
  id,
  className,
  type,
  disabled,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const { t: tCommon } = useTranslation()

  const generatedId = React.useId()
  const inputId = id || `field-${generatedId}`
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const actualType = isPasswordField && showPassword ? 'text' : type || (isPasswordField ? 'password' : 'text')

  // Size classes
  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  }

  // Variant classes
  const variantClasses = {
    default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
    filled: 'border-0 bg-gray-100 dark:bg-gray-700',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent'
  }

  const getInputClasses = () => {
    return cn(
      // Base styles
      'w-full rounded-lg transition-all duration-200',
      'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300',

      // Size
      sizeClasses[size],

      // Variant
      variantClasses[variant],

      // Icon padding
      !!icon && 'pl-10',
      !!(isPasswordField && showPasswordToggle) && 'pr-10',

      // Error state
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',

      // Focus state
      isFocused && !error && 'border-gray-900 dark:border-gray-300',

      // Disabled state
      disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700',

      inputClassName
    )
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    props.onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    props.onBlur?.(e)
  }

  return (
    <div className={cn('space-y-1', containerClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium text-gray-700 dark:text-gray-300',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          type={actualType}
          className={cn(getInputClasses(), className)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={cn(
            error && errorId,
            helperText && helperId
          ).trim() || undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Password Toggle */}
        {isPasswordField && showPasswordToggle && (
          <button
            type="button"
            onClick={handleTogglePassword}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600 dark:focus:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={showPassword ? tCommon('ui.accessibility.hidePassword') : tCommon('ui.accessibility.showPassword')}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          id={errorId}
          role="alert"
          className={cn(
            'flex items-center space-x-1 text-sm text-red-600 dark:text-red-400',
            errorClassName
          )}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <div
          id={helperId}
          className={cn(
            'text-xs text-gray-500 dark:text-gray-400',
            helperClassName
          )}
        >
          {helperText}
        </div>
      )}
    </div>
  )
})

FormField.displayName = 'FormField'

export default FormField
