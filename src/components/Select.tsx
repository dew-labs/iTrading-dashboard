import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

interface SelectProps {
  'options': SelectOption[]
  'value': string
  'onChange': (value: string) => void
  'placeholder'?: string
  'disabled'?: boolean
  'className'?: string
  'size'?: 'sm' | 'md' | 'lg'
  'variant'?: 'default' | 'minimal'
  'label'?: string
  'error'?: string
  'required'?: boolean
  'aria-label'?: string
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  size = 'md',
  variant = 'default',
  label,
  error,
  required = false,
  'aria-label': ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const selectRef = useRef<HTMLDivElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(option => option.value === value)

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'px-3 py-2 text-sm',
      option: 'px-3 py-2 text-sm',
      icon: 'w-4 h-4',
      dropdown: 'mt-1'
    },
    md: {
      button: 'px-4 py-2.5 text-sm',
      option: 'px-4 py-2.5 text-sm',
      icon: 'w-4 h-4',
      dropdown: 'mt-2'
    },
    lg: {
      button: 'px-4 py-3 text-base',
      option: 'px-4 py-3 text-base',
      icon: 'w-5 h-5',
      dropdown: 'mt-2'
    }
  }

  const config = sizeConfig[size]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return

    switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isOpen && focusedIndex >= 0) {
        const option = options[focusedIndex]
        if (option && !option.disabled) {
          onChange(option.value)
          setIsOpen(false)
          setFocusedIndex(-1)
        }
      } else {
        setIsOpen(!isOpen)
      }
      break
    case 'Escape':
      setIsOpen(false)
      setFocusedIndex(-1)
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        const nextIndex = focusedIndex < options.length - 1 ? focusedIndex + 1 : 0
        setFocusedIndex(nextIndex)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : options.length - 1
        setFocusedIndex(prevIndex)
      }
      break
    }
  }

  const handleOptionClick = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value)
      setIsOpen(false)
      setFocusedIndex(-1)
    }
  }

  const getButtonStyles = () => {
    const baseStyles = `
      relative w-full bg-white border rounded-lg
      flex items-center justify-between
      transition-colors duration-200 ease-in-out
      focus:outline-none focus:border-black
      ${config.button}
    `

    if (disabled) {
      return `${baseStyles} border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed`
    }

    if (error) {
      return `${baseStyles} border-red-300 hover:border-red-400 text-gray-900 focus:border-red-500`
    }

    if (variant === 'minimal') {
      return `${baseStyles} border-transparent hover:bg-gray-50 text-gray-900 focus:border-black`
    }

    return `${baseStyles} border-gray-300 hover:border-gray-400 text-gray-900 focus:border-black`
  }

  const getDropdownStyles = () => {
    return `
      absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg
      max-h-60 overflow-auto
      ${config.dropdown}
      ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}
      transition-all duration-200 ease-out
    `
  }

  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className={`block text-sm font-medium mb-1 ${
            disabled ? 'text-gray-400' : error ? 'text-red-700' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      {/* Select Button */}
      <div ref={selectRef} className='relative'>
        <button
          id={selectId}
          type='button'
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-haspopup='listbox'
          aria-required={required}
          className={getButtonStyles()}
        >
          <div className='flex items-center'>
            {selectedOption?.icon && (
              <span className='mr-2 flex-shrink-0'>{selectedOption.icon}</span>
            )}
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <ChevronDown
            className={`${config.icon} text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown */}
        <div ref={optionsRef} className={getDropdownStyles()}>
          <div role='listbox' aria-labelledby={selectId}>
            {options.map((option, index) => (
              <div
                key={option.value}
                role='option'
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`
                  ${config.option}
                  flex items-center justify-between cursor-pointer
                  transition-colors duration-150
                  ${
              option.disabled
                ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                : focusedIndex === index
                  ? 'bg-gray-900 text-white'
                  : option.value === value
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-900 hover:bg-gray-50'
              }
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === options.length - 1 ? 'rounded-b-lg' : ''}
                `}
              >
                <div className='flex items-center'>
                  {option.icon && <span className='mr-2 flex-shrink-0'>{option.icon}</span>}
                  <span className={option.disabled ? 'opacity-50' : ''}>{option.label}</span>
                </div>

                {option.value === value && (
                  <Check
                    className={`w-4 h-4 flex-shrink-0 ${
                      focusedIndex === index ? 'text-white' : 'text-gray-900'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className='mt-1 text-sm text-red-600' role='alert'>
          {error}
        </p>
      )}
    </div>
  )
}

export default Select
