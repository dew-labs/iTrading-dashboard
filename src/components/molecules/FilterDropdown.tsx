import React, { useState, useRef, useEffect } from 'react'
import { Filter, ChevronDown, X } from 'lucide-react'
import { cn } from '../../utils/theme'
import { useMultipleTranslations, useTranslation } from '../../hooks/useTranslation'

interface FilterOption {
  value: string
  label?: string
  labelKey?: string
  disabled?: boolean
  description?: string
}

interface FilterDropdownProps {
  /** Array of filter options */
  options: FilterOption[]
  /** Currently selected value */
  value: string
  /** Callback when selection changes */
  onChange: (value: string) => void
  /** Filter name/label for display */
  label: string
  /** Additional CSS classes */
  className?: string
  /** Show clear button when value is not 'all' */
  showClear?: boolean
  /** Disable the filter */
  disabled?: boolean
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  value,
  onChange,
  label,
  className = '',
  showClear = true,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t } = useMultipleTranslations(['common', 'forms', 'navigation'])
  const { t: tCommon } = useTranslation('common')

  // Helper function to get the display label for an option
  const getOptionLabel = (option: FilterOption): string => {
    if (option.labelKey) {
      // Try to get from common namespace with proper prefix
      if (option.labelKey.startsWith('all')) {
        return tCommon(`filters.${option.labelKey}`)
      } else if (
        ['active', 'inactive', 'published', 'draft', 'invited', 'suspended'].includes(
          option.labelKey
        )
      ) {
        return tCommon(`status.${option.labelKey}`)
      } else if (
        ['news', 'tutorial', 'guide', 'announcement', 'event', 'subscription', 'oneTime'].includes(
          option.labelKey
        )
      ) {
        return tCommon(`content.${option.labelKey}`)
      } else if (['user', 'admin', 'moderator'].includes(option.labelKey)) {
        return tCommon(`roles.${option.labelKey}`)
      } else {
        // Try without namespace first, then fallback to direct key
        return t(option.labelKey) || option.labelKey
      }
    }
    return option.label || option.value
  }

  const selectedOption = options.find(option => option.value === value)
  const isActive = value !== 'all' && value !== ''
  const hasMultipleOptions = options.length > 1

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('all')
    setIsOpen(false)
  }

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      {/* Main Filter Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'inline-flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors duration-200',
          'focus:outline-none focus:border-black dark:focus:border-white',
          disabled
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed'
            : isActive
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md hover:shadow-lg'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
        )}
      >
        {/* Filter Icon */}
        <Filter className={cn('w-3.5 h-3.5', isActive ? 'text-white dark:text-gray-900' : 'text-gray-400 dark:text-gray-500')} />

        {/* Label */}
        <span className='whitespace-nowrap'>{label}</span>

        {/* Selected Value (if not 'all') */}
        {isActive && selectedOption && (
          <>
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                'bg-white/20 dark:bg-gray-900/20 text-white dark:text-gray-900 border border-white/30 dark:border-gray-900/30'
              )}
            >
              {getOptionLabel(selectedOption)}
            </span>
          </>
        )}

        {/* Clear Button */}
        {isActive && showClear && (
          <button
            onClick={handleClear}
            className={cn(
              'p-0.5 rounded hover:bg-white/20 dark:hover:bg-gray-900/20 transition-colors',
              'text-white/80 dark:text-gray-900/80 hover:text-white dark:hover:text-gray-900'
            )}
            title={`Clear ${label.toLowerCase()} filter`}
          >
            <X className='w-3 h-3' />
          </button>
        )}

        {/* Dropdown Arrow */}
        {hasMultipleOptions && (
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 transition-transform duration-200',
              isActive ? 'text-white dark:text-gray-900' : 'text-gray-400 dark:text-gray-500',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && hasMultipleOptions && (
        <div
          className={cn(
            'absolute top-full left-0 mt-1 min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50',
            'max-h-60 overflow-auto',
            'animate-in fade-in-0 zoom-in-95 duration-100'
          )}
        >
          <div role='listbox'>
            {options.map((option, index) => (
              <div
                key={option.value}
                role='option'
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                onClick={() => !option.disabled && handleOptionClick(option.value)}
                className={cn(
                  'px-3 py-2 text-sm cursor-pointer',
                  'flex items-center justify-between',
                  'transition-colors duration-150',
                  option.disabled
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
                    : option.value === value
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700',
                  // Apply border radius to first and last items
                  index === 0 ? 'rounded-t-lg' : '',
                  index === options.length - 1 ? 'rounded-b-lg' : ''
                )}
              >
                <span className={option.disabled ? 'opacity-50' : ''}>
                  {getOptionLabel(option)}
                </span>

                {option.value === value && <div className='w-2 h-2 bg-white dark:bg-gray-900 rounded-full' />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterDropdown
