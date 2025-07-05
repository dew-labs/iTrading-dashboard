import React, { forwardRef } from 'react'
import { cn } from '../../utils/theme'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  inputSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      inputSize = 'md',
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    const getTextareaClasses = () => {
      const baseClasses = [
        'border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:border-transparent',
        'transition-all duration-200',
        fullWidth && 'w-full'
      ]

      const sizeClasses = {
        sm: 'p-1.5 text-sm',
        md: 'p-2 text-sm',
        lg: 'p-3 text-base'
      }
      baseClasses.push(sizeClasses[inputSize])

      if (error) {
        baseClasses.push('border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500')
      }

      if (disabled) {
        baseClasses.push('bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600')
      }

      return cn(...baseClasses, className)
    }

    return (
      <div className={cn('space-y-1', !fullWidth && 'inline-block')}>
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'block text-sm font-medium',
              error ? 'text-red-700 dark:text-red-400' : disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {label}
            {props.required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={getTextareaClasses()}
          disabled={disabled}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
