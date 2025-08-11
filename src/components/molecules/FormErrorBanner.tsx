import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '../../utils/theme'

interface FormErrorBannerProps {
  error?: string | null
  errors?: Record<string, string>
  onDismiss?: () => void
  className?: string
  variant?: 'error' | 'warning'
}

/**
 * FormErrorBanner - Standardized error display component for forms
 * Displays form-level errors and validation messages in a consistent banner format
 */
const FormErrorBanner: React.FC<FormErrorBannerProps> = ({
  error,
  errors,
  onDismiss,
  className,
  variant = 'error'
}) => {
  // Don't render if no errors
  if (!error && (!errors || Object.keys(errors).length === 0)) {
    return null
  }

  const hasMultipleErrors = errors && Object.keys(errors).length > 1
  const errorMessages = errors ? Object.values(errors).filter(Boolean) : []

  const bannerClasses = cn(
    'rounded-lg p-4 border flex items-start space-x-3',
    variant === 'error' && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    variant === 'warning' && 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    className
  )

  const iconClasses = cn(
    'w-5 h-5 mt-0.5 flex-shrink-0',
    variant === 'error' && 'text-red-600 dark:text-red-400',
    variant === 'warning' && 'text-yellow-600 dark:text-yellow-400'
  )

  const textClasses = cn(
    'text-sm flex-1',
    variant === 'error' && 'text-red-700 dark:text-red-300',
    variant === 'warning' && 'text-yellow-700 dark:text-yellow-300'
  )

  return (
    <div 
      className={bannerClasses}
      role='alert'
      aria-live='polite'
      aria-describedby='form-error-description'
    >
      <AlertTriangle className={iconClasses} />
      
      <div className='flex-1'>
        {/* Single error message */}
        {error && (
          <p id='form-error-description' className={textClasses}>
            {error}
          </p>
        )}
        
        {/* Multiple validation errors */}
        {errorMessages.length > 0 && (
          <div id='form-error-description'>
            {hasMultipleErrors ? (
              <div className='space-y-1'>
                <p className={cn(textClasses, 'font-medium')}>
                  Please fix the following errors:
                </p>
                <ul className={cn(textClasses, 'list-disc list-inside space-y-1 ml-2')}>
                  {errorMessages.map((message, index) => (
                    <li key={index}>{message}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={textClasses}>{errorMessages[0]}</p>
            )}
          </div>
        )}
      </div>
      
      {/* Dismiss button */}
      {onDismiss && (
        <button
          type='button'
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 rounded-md p-1.5 transition-colors',
            variant === 'error' && 'text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-300',
            variant === 'warning' && 'text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 hover:text-yellow-600 dark:hover:text-yellow-300'
          )}
          aria-label='Dismiss error message'
        >
          <X className='w-4 h-4' />
        </button>
      )}
    </div>
  )
}

export default FormErrorBanner