import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface PopoverMenuOption {
  value: string
  label: string
  sublabel?: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface PopoverMenuProps {
  options: PopoverMenuOption[]
  value: string
  onChange: (value: string) => void
  renderTrigger?: (selected: PopoverMenuOption | undefined, open: boolean) => React.ReactNode
  className?: string
  dropdownClassName?: string
  placeholder?: string
  ariaLabel?: string
  placement?: 'right' | 'bottom' | 'left'
}

const PopoverMenu: React.FC<PopoverMenuProps> = ({
  options,
  value,
  onChange,
  renderTrigger,
  className = '',
  dropdownClassName = '',
  placeholder = 'Select...',
  ariaLabel,
  placement = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selected = options.find(opt => opt.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        setIsOpen(true)
        setFocusedIndex(idx => {
          const next = idx < options.length - 1 ? idx + 1 : 0
          if (options[next] && options[next].disabled) return idx
          return next
        })
        break
      }
      case 'ArrowUp': {
        event.preventDefault()
        setIsOpen(true)
        setFocusedIndex(idx => {
          const prev = idx > 0 ? idx - 1 : options.length - 1
          if (options[prev] && options[prev].disabled) return idx
          return prev
        })
        break
      }
      case 'Enter':
      case ' ': {
        if (isOpen && focusedIndex >= 0 && options[focusedIndex] && !options[focusedIndex].disabled) {
          onChange(options[focusedIndex].value)
          setIsOpen(false)
          setFocusedIndex(-1)
        } else {
          setIsOpen(open => !open)
        }
        break
      }
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        break
    }
  }

  const handleOptionClick = (option: PopoverMenuOption) => {
    if (!option.disabled) {
      onChange(option.value)
      setIsOpen(false)
      setFocusedIndex(-1)
    }
  }

  // Placement styles
  let dropdownPosition = ''
  if (placement === 'right') {
    dropdownPosition = 'left-full top-0 ml-2'
  } else if (placement === 'left') {
    dropdownPosition = 'right-full top-0 mr-6'
  } else {
    dropdownPosition = 'left-0 top-full mt-2'
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      {renderTrigger ? (
        <div onClick={() => setIsOpen(open => !open)} tabIndex={0} onKeyDown={handleKeyDown} aria-label={ariaLabel} role="button" aria-haspopup="listbox" aria-expanded={isOpen}>
          {renderTrigger(selected, isOpen)}
        </div>
      ) : (
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-colors"
          onClick={() => setIsOpen(open => !open)}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center">
            {selected && selected.icon && <span className="mr-2">{selected.icon}</span>}
            <span>{selected ? selected.label : placeholder}</span>
            {selected && selected.sublabel && <span className="ml-2 text-xs text-gray-500">{selected.sublabel}</span>}
          </div>
          <ChevronDown className={`w-4 h-4 ml-2 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      )}
      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute ${dropdownPosition} min-w-[220px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 ${dropdownClassName}`} role="listbox">
          {options.map((option, idx) => {
            if (!option) return null;
            return (
              <button
                key={option.value}
                type="button"
                disabled={option.disabled}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={`w-full flex items-center px-4 py-2 text-left transition-colors
                  ${option.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : option.value === value
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}
                  ${idx === 0 ? 'rounded-t-xl' : ''}
                  ${idx === options.length - 1 ? 'rounded-b-xl' : ''}
                  ${focusedIndex === idx && !option.disabled && option.value !== value ? '' : ''}
                `}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                tabIndex={-1}
              >
                {option.icon && <span className="mr-3">{option.icon}</span>}
                <div className="flex-1 flex flex-col items-start">
                  <span className={option.value === value ? 'font-semibold' : ''}>{option.label}</span>
                  {option.sublabel && (
                    <span
                      className={`text-xs ${option.value === value ? 'text-gray-200 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      {option.sublabel}
                    </span>
                  )}
                </div>
                {option.value === value && (
                  <span className="ml-3 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white dark:bg-gray-900 block" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PopoverMenu
