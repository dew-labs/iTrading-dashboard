import React from 'react'
import { Filter } from 'lucide-react'
import Select from './Select'
import { cn } from '../utils/theme'

interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

interface FilterDropdownProps {
  /** Array of filter options */
  options: FilterOption[];
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Placeholder text when no option is selected */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'minimal' | 'outlined';
  /** Filter label for accessibility */
  label?: string;
  /** Show filter icon */
  showIcon?: boolean;
  /** Disable the filter */
  disabled?: boolean;
  /** Error state */
  error?: string;
  /** Width constraint */
  width?: 'auto' | 'full' | 'fixed';
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'All',
  className = '',
  size = 'sm',
  variant = 'outlined',
  label,
  showIcon = true,
  disabled = false,
  error,
  width = 'fixed'
}) => {
  // Convert FilterOption to SelectOption format
  const selectOptions = options.map(option => ({
    value: option.value,
    label: option.label,
    ...(option.disabled !== undefined && { disabled: option.disabled })
  }))

  // Get width classes
  const getWidthClasses = () => {
    switch (width) {
    case 'full':
      return 'w-full'
    case 'auto':
      return 'w-auto min-w-[120px]'
    case 'fixed':
    default:
      return 'w-48'
    }
  }

  // Get wrapper styles based on variant
  const getWrapperClasses = () => {
    const baseClasses = 'flex items-center space-x-2'

    switch (variant) {
    case 'minimal':
      return cn(baseClasses, 'px-2 py-1 rounded-md hover:bg-gray-50 transition-colors')
    case 'outlined':
      return cn(baseClasses, 'px-3 py-2 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors')
    case 'default':
    default:
      return baseClasses
    }
  }

  // Custom render function for the select button to include filter icon
  const customSelectComponent = showIcon ? (
    <div className={cn(getWrapperClasses(), getWidthClasses())}>
      <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Select
          options={selectOptions}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          size={size}
          variant="minimal"
          disabled={disabled}
          {...(error && { error })}
          aria-label={label || 'Filter options'}
          className="border-none shadow-none"
        />
      </div>
    </div>
  ) : null

  // If using custom wrapper, return it
  if (showIcon && variant !== 'default') {
    return (
      <div className={cn('relative', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        {customSelectComponent}
      </div>
    )
  }

  // Default implementation without custom wrapper
  return (
    <div className={cn('relative', getWidthClasses(), className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {showIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Filter className="w-4 h-4 text-gray-400" />
          </div>
        )}

        <Select
          options={selectOptions}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          size={size}
          variant={variant === 'minimal' ? 'minimal' : 'default'}
          disabled={disabled}
          {...(error && { error })}
          aria-label={label || 'Filter options'}
          className={cn(
            showIcon && 'pl-10',
            getWidthClasses()
          )}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default FilterDropdown
