import React, { forwardRef } from 'react'
import { cn } from '../../utils/theme'
import { INPUT_VARIANTS, ICON_SIZES, type InputVariant } from '../../constants/ui'
import type { LucideIcon } from 'lucide-react'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  variant?: InputVariant
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
      variant = INPUT_VARIANTS.DEFAULT,
      inputSize = 'md',
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const getInputClasses = () => {
      const baseClasses = [
        'border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400',
        'transition-all duration-200 ease-in-out',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'dark:bg-gray-800 dark:text-white dark:placeholder-gray-400',
        fullWidth && 'w-full'
      ]

      // Hide number input spinners
      if (props.type === 'number') {
        baseClasses.push(
          '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          '[&[type=number]]:appearance-none'
        )
      }

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
      if (variant === INPUT_VARIANTS.ERROR || error) {
        baseClasses.push(
          'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:focus:ring-red-400 dark:focus:border-red-400'
        )
      } else {
        baseClasses.push('border-gray-300 dark:border-gray-600')
      }

      return baseClasses.join(' ')
    }

    const getIconClasses = () => {
      const iconSize = inputSize === 'sm' ? ICON_SIZES.SM : inputSize === 'lg' ? ICON_SIZES.MD : ICON_SIZES.SM
      return `${iconSize} text-gray-400 dark:text-gray-500 pointer-events-none`
    }

    const getIconPosition = (position: 'left' | 'right') => {
      return position === 'left'
        ? inputSize === 'sm'
          ? 'left-3'
          : inputSize === 'lg'
          ? 'left-4'
          : 'left-3'
        : inputSize === 'sm'
        ? 'right-3'
        : inputSize === 'lg'
        ? 'right-4'
        : 'right-3'
    }

    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-gray-700 dark:text-gray-300',
              error && 'text-red-600 dark:text-red-400'
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(getInputClasses(), className)}
            {...props}
          />
          {LeftIcon && (
            <LeftIcon className={cn(getIconClasses(), 'absolute top-1/2 transform -translate-y-1/2', getIconPosition('left'))} />
          )}
          {RightIcon && (
            <RightIcon className={cn(getIconClasses(), 'absolute top-1/2 transform -translate-y-1/2', getIconPosition('right'))} />
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
