import React, { useId } from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '../../utils/theme'
import { KEYBOARD_KEYS } from '../../constants/ui'

interface CheckboxProps {
  id?: string
  checked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'rounded'
  className?: string
  onChange?: (checked: boolean) => void
  onFocus?: () => void
  onBlur?: () => void
  'aria-label'?: string
  'aria-describedby'?: string
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  description,
  size = 'md',
  variant = 'default',
  className,
  onChange,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby
}) => {
  const generatedId = useId()
  const checkboxId = id || generatedId

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const newChecked = event.target.checked
    onChange?.(newChecked)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === KEYBOARD_KEYS.SPACE || e.key === KEYBOARD_KEYS.ENTER) {
      e.preventDefault()
      if (!disabled && onChange) {
        onChange(!checked)
      }
    }
  }

  // Size classes
  const sizeClasses = {
    sm: {
      checkbox: 'w-4 h-4',
      icon: 'w-2.5 h-2.5',
      label: 'text-sm',
      description: 'text-xs'
    },
    md: {
      checkbox: 'w-5 h-5',
      icon: 'w-3 h-3',
      label: 'text-base',
      description: 'text-sm'
    },
    lg: {
      checkbox: 'w-6 h-6',
      icon: 'w-4 h-4',
      label: 'text-lg',
      description: 'text-base'
    }
  }

  const currentSize = sizeClasses[size]

  const getCheckboxStyles = () => {
    const baseClasses = [
      'relative inline-flex items-center justify-center',
      'border-2 transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 dark:focus:ring-white',
      currentSize.checkbox,
      variant === 'rounded' ? 'rounded-full' : 'rounded-md'
    ]

    // State-dependent classes
    if (disabled) {
      baseClasses.push(
        'bg-gray-100 border-gray-300 cursor-not-allowed',
        'dark:bg-gray-800 dark:border-gray-600'
      )
    } else if (checked || indeterminate) {
      baseClasses.push(
        'bg-black border-black text-white',
        'hover:bg-gray-900 hover:border-gray-900',
        'dark:bg-white dark:border-white dark:text-black',
        'dark:hover:bg-gray-100 dark:hover:border-gray-100'
      )
    } else {
      baseClasses.push(
        'bg-white border-gray-300 text-gray-900',
        'hover:border-gray-400 hover:bg-gray-50',
        'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
        'dark:hover:border-gray-500 dark:hover:bg-gray-700'
      )
    }

    return cn(...baseClasses, className)
  }

  const renderIcon = () => {
    if (indeterminate) {
      return <Minus className={cn(currentSize.icon, 'stroke-current')} />
    }
    if (checked) {
      return <Check className={cn(currentSize.icon, 'stroke-current')} />
    }
    return null
  }

  return (
    <div className={cn('flex items-start', className)}>
      {/* Hidden input for accessibility and form submission */}
      <input
        id={checkboxId}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className="sr-only"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
      />

      {/* Custom checkbox */}
      <label
        htmlFor={checkboxId}
        className={getCheckboxStyles()}
        role='checkbox'
        aria-checked={indeterminate ? 'mixed' : checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        {renderIcon()}
      </label>

      {/* Label and description */}
      {(label || description) && (
        <div className="ml-3 flex-1">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'block font-medium cursor-pointer',
                currentSize.label,
                disabled
                  ? 'text-gray-400 cursor-not-allowed dark:text-gray-500'
                  : 'text-gray-900 dark:text-gray-100'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              className={cn(
                'mt-1',
                currentSize.description,
                disabled
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default Checkbox
