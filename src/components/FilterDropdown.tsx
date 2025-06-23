import React, { useState, useRef, useEffect } from 'react'
import { Filter, ChevronDown, X } from 'lucide-react'
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
  /** Filter name/label for display */
  label: string;
  /** Additional CSS classes */
  className?: string;
  /** Show clear button when value is not 'all' */
  showClear?: boolean;
  /** Disable the filter */
  disabled?: boolean;
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
          'focus:outline-none focus:border-black',
          disabled
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : isActive
              ? 'bg-gray-900 text-white border-gray-900 shadow-md hover:shadow-lg'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        )}
      >
        {/* Filter Icon */}
        <Filter className={cn(
          'w-3.5 h-3.5',
          isActive ? 'text-white' : 'text-gray-400'
        )} />

        {/* Label */}
        <span className="whitespace-nowrap">{label}</span>

        {/* Selected Value (if not 'all') */}
        {isActive && selectedOption && (
          <>
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded',
              'bg-white/20 text-white border border-white/30'
            )}>
              {selectedOption.label}
            </span>
          </>
        )}

        {/* Clear Button */}
        {isActive && showClear && (
          <button
            onClick={handleClear}
            className={cn(
              'p-0.5 rounded hover:bg-white/20 transition-colors',
              'text-white/80 hover:text-white'
            )}
            title={`Clear ${label.toLowerCase()} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Dropdown Arrow */}
        {hasMultipleOptions && (
          <ChevronDown className={cn(
            'w-3.5 h-3.5 transition-transform duration-200',
            isActive ? 'text-white' : 'text-gray-400',
            isOpen && 'rotate-180'
          )} />
        )}

      </button>

      {/* Dropdown Menu */}
      {isOpen && hasMultipleOptions && (
        <div className={cn(
          'absolute top-full left-0 mt-1 min-w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50',
          'max-h-60 overflow-auto',
          'animate-in fade-in-0 zoom-in-95 duration-100'
        )}>
          <div role="listbox">
            {options.map((option, index) => (
              <div
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                onClick={() => !option.disabled && handleOptionClick(option.value)}
                className={cn(
                  'px-3 py-2 text-sm cursor-pointer',
                  'flex items-center justify-between',
                  'transition-colors duration-150',
                  option.disabled
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : option.value === value
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-900 hover:bg-gray-50',
                  // Apply border radius to first and last items
                  index === 0 ? 'rounded-t-lg' : '',
                  index === options.length - 1 ? 'rounded-b-lg' : ''
                )}
              >
                <span className={option.disabled ? 'opacity-50' : ''}>
                  {option.label}
                </span>

                {option.value === value && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default FilterDropdown
