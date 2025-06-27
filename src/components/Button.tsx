import React from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '../utils/theme'

// Enhanced button variants with better shadows
const BUTTON_VARIANTS = {
  primary:
    'inline-flex items-center justify-center font-medium bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',

  secondary:
    'inline-flex items-center justify-center font-medium border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',

  danger:
    'inline-flex items-center justify-center font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',

  ghost:
    'inline-flex items-center justify-center font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',

  icon: 'inline-flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
} as const

const BUTTON_SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
  icon: 'p-2'
} as const

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_VARIANTS
  size?: keyof typeof BUTTON_SIZES
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  loading = false,
  loadingText,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const isDisabled = disabled || loading

  const buttonClasses = cn(
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    fullWidth && 'w-full',
    className
  )

  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          {loadingText || 'Loading...'}
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className='w-4 h-4 mr-2' />}
          {children}
          {RightIcon && <RightIcon className='w-4 h-4 ml-2' />}
        </>
      )}
    </button>
  )
}

export default Button
