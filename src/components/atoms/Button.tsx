import React from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '../../utils/theme'
import { BUTTON_VARIANTS, BUTTON_SIZES } from '../../constants/components'

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
      aria-disabled={isDisabled}
      aria-live={loading ? 'polite' : undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className='w-4 h-4 mr-2 animate-spin' aria-hidden='true' />
          <span>{loadingText || 'Loading...'}</span>
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className='w-4 h-4 mr-2' aria-hidden='true' />}
          {children}
          {RightIcon && <RightIcon className='w-4 h-4 ml-2' aria-hidden='true' />}
        </>
      )}
    </button>
  )
}

export default Button
