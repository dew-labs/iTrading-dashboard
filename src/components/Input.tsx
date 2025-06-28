import React, { forwardRef } from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '../utils/theme'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  variant?: 'default' | 'search' | 'error'
  inputSize?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      variant = 'default',
      inputSize = 'md',
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`

    const getInputClasses = () => {
      const baseClasses = [
        'border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:border-transparent',
        'transition-all duration-200',
        fullWidth && 'w-full'
      ]

      // Base size classes
      const baseSizeClasses = {
        sm: 'py-1.5 text-sm',
        md: 'py-2 text-sm',
        lg: 'py-3 text-base'
      }

      // Add base size classes
      baseClasses.push(baseSizeClasses[inputSize])

      // Add padding based on icons
      if (LeftIcon && RightIcon) {
        if (inputSize === 'sm') baseClasses.push('pl-9 pr-9')
        else if (inputSize === 'lg') baseClasses.push('pl-11 pr-11')
        else baseClasses.push('pl-10 pr-10')
      } else if (LeftIcon) {
        if (inputSize === 'sm') baseClasses.push('pl-9 pr-3')
        else if (inputSize === 'lg') baseClasses.push('pl-11 pr-4')
        else baseClasses.push('pl-10 pr-3')
      } else if (RightIcon) {
        if (inputSize === 'sm') baseClasses.push('pl-3 pr-9')
        else if (inputSize === 'lg') baseClasses.push('pl-4 pr-11')
        else baseClasses.push('pl-3 pr-10')
      } else {
        if (inputSize === 'sm') baseClasses.push('px-3')
        else if (inputSize === 'lg') baseClasses.push('px-4')
        else baseClasses.push('px-3')
      }

      // Variant classes
      if (variant === 'error' || error) {
        baseClasses.push('border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500')
      }

      // Disabled state
      if (disabled) {
        baseClasses.push('bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600')
      }

      return cn(...baseClasses, className)
    }

    const getIconClasses = () => {
      const iconSize = inputSize === 'sm' ? 'w-4 h-4' : inputSize === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
      return `${iconSize} text-gray-400 dark:text-gray-500 pointer-events-none`
    }

    const getIconPosition = (position: 'left' | 'right') => {
      const verticalCenter = 'top-1/2 transform -translate-y-1/2'
      const horizontalPosition =
        position === 'left'
          ? inputSize === 'sm'
            ? 'left-2.5'
            : inputSize === 'lg'
              ? 'left-3.5'
              : 'left-3'
          : inputSize === 'sm'
            ? 'right-2.5'
            : inputSize === 'lg'
              ? 'right-3.5'
              : 'right-3'

      return `absolute ${verticalCenter} ${horizontalPosition}`
    }

    return (
      <div className={cn('space-y-1', !fullWidth && 'inline-block')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium',
              error ? 'text-red-700 dark:text-red-400' : disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {label}
            {props.required && <span className='text-red-500 ml-1'>*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className='relative'>
          {/* Left Icon */}
          {LeftIcon && <LeftIcon className={cn(getIconClasses(), getIconPosition('left'))} />}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={getInputClasses()}
            disabled={disabled}
            {...props}
          />

          {/* Right Icon */}
          {RightIcon && <RightIcon className={cn(getIconClasses(), getIconPosition('right'))} />}
        </div>

        {/* Helper Text or Error */}
        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400')}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
