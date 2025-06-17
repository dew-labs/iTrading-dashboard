import React, { forwardRef } from 'react'
import { Check, Minus } from 'lucide-react'

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'rounded';
  className?: string;
  onChange?: (checked: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  id,
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  description,
  size = 'md',
  variant = 'default',
  className = '',
  onChange,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && onChange) {
      onChange(event.target.checked)
    }
  }

  // Size configurations
  const sizeConfig = {
    sm: {
      checkbox: 'w-4 h-4',
      icon: 'w-3 h-3',
      text: 'text-sm',
      description: 'text-xs'
    },
    md: {
      checkbox: 'w-5 h-5',
      icon: 'w-3.5 h-3.5',
      text: 'text-sm',
      description: 'text-xs'
    },
    lg: {
      checkbox: 'w-6 h-6',
      icon: 'w-4 h-4',
      text: 'text-base',
      description: 'text-sm'
    }
  }

  const config = sizeConfig[size]

  // Base checkbox styles
  const checkboxBaseStyles = `
    relative inline-flex items-center justify-center
    border-2 transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
    cursor-pointer group
    ${config.checkbox}
    ${variant === 'rounded' ? 'rounded-full' : 'rounded-md'}
  `

  // Checkbox state styles
  const getCheckboxStyles = () => {
    if (disabled) {
      return `
        ${checkboxBaseStyles}
        border-gray-300 bg-gray-100 cursor-not-allowed
        ${checked || indeterminate ? 'bg-gray-400 border-gray-400' : ''}
      `
    }

    if (checked || indeterminate) {
      return `
        ${checkboxBaseStyles}
        border-gray-900 bg-gradient-to-br from-gray-900 to-black
        hover:from-black hover:to-gray-900
        shadow-lg shadow-gray-900/25
        transform hover:scale-105
      `
    }

    return `
      ${checkboxBaseStyles}
      border-gray-300 bg-white
      hover:border-gray-900 hover:bg-gray-50
      group-hover:shadow-md
    `
  }

  // Icon styles
  const iconStyles = `
    ${config.icon}
    transition-all duration-200 ease-in-out
    ${checked || indeterminate ? 'text-white opacity-100 scale-100' : 'text-transparent opacity-0 scale-75'}
  `

  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  const descriptionId = description ? `${checkboxId}-description` : undefined

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="relative flex items-center">
        {/* Hidden native input for accessibility */}
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy || descriptionId}
          className="sr-only"
          {...props}
        />

        {/* Custom checkbox */}
        <label
          htmlFor={checkboxId}
          className={getCheckboxStyles()}
          role="checkbox"
          aria-checked={indeterminate ? 'mixed' : checked}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              if (!disabled && onChange) {
                onChange(!checked)
              }
            }
          }}
        >
          {/* Checkmark or indeterminate icon */}
          {indeterminate ? (
            <Minus className={iconStyles} strokeWidth={3} />
          ) : (
            <Check className={iconStyles} strokeWidth={3} />
          )}

          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-md opacity-0 group-active:opacity-20 bg-gray-900 transition-opacity duration-150" />
        </label>
      </div>

      {/* Label and description */}
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`
                block font-medium cursor-pointer transition-colors
                ${config.text}
                ${disabled ? 'text-gray-400' : 'text-gray-900 hover:text-black'}
              `}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              id={descriptionId}
              className={`
                mt-1 leading-relaxed
                ${config.description}
                ${disabled ? 'text-gray-300' : 'text-gray-600'}
              `}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
