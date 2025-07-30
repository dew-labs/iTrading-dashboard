import React, { useState, useRef, useEffect } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: boolean
  className?: string
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className = ''
}) => {
  const [_activeIndex, setActiveIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Auto-focus first empty input when component mounts or value changes
  useEffect(() => {
    const firstEmptyIndex = value.split('').findIndex((char, index) => !char && index < length)
    const targetIndex = firstEmptyIndex === -1 ? Math.min(value.length, length - 1) : firstEmptyIndex
    
    if (inputRefs.current[targetIndex] && !disabled) {
      inputRefs.current[targetIndex]?.focus()
      setActiveIndex(targetIndex)
    }
  }, [value, length, disabled])

  // Note: We don't auto-clear inputs on error anymore
  // Errors should persist until user actively starts typing

  // Call onComplete when all digits are filled
  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value)
    }
  }, [value, length, onComplete])

  const handleChange = (index: number, digit: string) => {
    // Only allow single digits
    if (digit.length > 1) return
    
    // Only allow numbers
    if (digit && !/^\d$/.test(digit)) return

    const newValue = value.split('')
    newValue[index] = digit
    
    // Fill in the array to the correct length
    while (newValue.length < length) {
      newValue.push('')
    }
    
    const finalValue = newValue.slice(0, length).join('')
    onChange(finalValue)

    // Move to next input if digit was entered
    if (digit && index < length - 1) {
      const nextIndex = index + 1
      inputRefs.current[nextIndex]?.focus()
      setActiveIndex(nextIndex)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Clear all on Escape key for easy retry
    if (e.key === 'Escape') {
      e.preventDefault()
      onChange('')
      inputRefs.current[0]?.focus()
      setActiveIndex(0)
      return
    }

    if (e.key === 'Backspace') {
      e.preventDefault()
      const newValue = value.split('')
      
      if (newValue[index]) {
        // Clear current digit
        newValue[index] = ''
      } else if (index > 0) {
        // Move to previous input and clear it
        newValue[index - 1] = ''
        inputRefs.current[index - 1]?.focus()
        setActiveIndex(index - 1)
      }
      
      const finalValue = newValue.slice(0, length).join('')
      onChange(finalValue)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
      setActiveIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    } else if (e.key === 'Delete') {
      e.preventDefault()
      const newValue = value.split('')
      newValue[index] = ''
      const finalValue = newValue.slice(0, length).join('')
      onChange(finalValue)
    }
  }

  const handleFocus = (index: number) => {
    setActiveIndex(index)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pastedData)
  }

  return (
    <div className={`flex gap-3 justify-center ${className}`}>
      {Array.from({ length }, (_, index) => {
        const digit = value[index] || ''
        
        return (
          <input
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`
              w-12 h-12 sm:w-14 sm:h-14 
              text-center text-lg sm:text-xl font-semibold
              border rounded-md
              transition-all duration-200 ease-in-out
              ${error 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:focus:ring-red-400 dark:focus:border-red-400' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-black focus:border-black dark:focus:ring-2 dark:focus:ring-white dark:focus:border-white'
              }
              ${disabled 
                ? 'cursor-not-allowed opacity-50' 
                : 'hover:border-gray-400 dark:hover:border-gray-500'
              }
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          />
        )
      })}
    </div>
  )
}

export default OTPInput