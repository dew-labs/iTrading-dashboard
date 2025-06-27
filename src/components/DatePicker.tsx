import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  name?: string
  id?: string
}

const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange,
  label,
  placeholder = 'Select date',
  error,
  disabled = false,
  required = false,
  className = '',
  name,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value && value.trim() ? new Date(value) : null
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update selected date when value prop changes
  useEffect(() => {
    if (value && value.trim()) {
      const date = new Date(value)
      setSelectedDate(date)
      setCurrentMonth(date)
    } else {
      setSelectedDate(null)
    }
  }, [value])

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateForInput = (date: Date): string => {
    const result = date.toISOString().split('T')[0]
    return result || ''
  }

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    onChange(formatDateForInput(date))
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value
    const date = parseDate(dateStr)
    if (date) {
      setSelectedDate(date)
      setCurrentMonth(date)
    }
    onChange(dateStr)
  }

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    const days: Date[] = []

    // Add empty cells for days before the first day of the month
    const startDay = firstDay.getDay()
    for (let i = 0; i < startDay; i++) {
      days.push(new Date(year, month, -startDay + i + 1))
    }

    // Add all days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    // Add empty cells for days after the last day of the month
    const endDay = lastDay.getDay()
    for (let i = 1; i < 7 - endDay; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isSameMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth()
  }

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  const displayValue = selectedDate ? formatDateForDisplay(selectedDate) : ''

  return (
    <div className={`space-y-2 ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className='block text-sm font-medium text-gray-700 mb-1'>
          {label} {required && <span className='text-red-500'>*</span>}
        </label>
      )}

      <div className='relative'>
        <div className='absolute left-3 top-1/2 transform -translate-y-1/2 z-10'>
          <Calendar className={`w-4 h-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        </div>

        {/* Custom display input that shows formatted date */}
        <div
          onClick={() => !disabled && setIsOpen(true)}
          className={`
            w-full pl-10 pr-4 py-2 border rounded-lg cursor-pointer
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}
          `}
        >
          <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
            {displayValue || placeholder}
          </span>
        </div>

        {/* Hidden native date input for actual form submission */}
        <input
          ref={inputRef}
          type='date'
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className='sr-only'
          tabIndex={-1}
        />

        {/* Custom Calendar Overlay */}
        {isOpen && !disabled && (
          <div className='absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-80'>
            {/* Calendar Header */}
            <div className='flex items-center justify-between mb-4'>
              <button
                type='button'
                onClick={() => navigateMonth('prev')}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>

              <h3 className='font-semibold text-gray-900'>{monthYear}</h3>

              <button
                type='button'
                onClick={() => navigateMonth('next')}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>

            {/* Day Headers */}
            <div className='grid grid-cols-7 gap-1 mb-2'>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className='text-center text-xs font-medium text-gray-500 p-2'>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className='grid grid-cols-7 gap-1'>
              {days.map((date, index) => {
                const isCurrentMonth = isSameMonth(date)
                const isSelectedDate = isSelected(date)
                const isTodayDate = isToday(date)

                return (
                  <button
                    key={index}
                    type='button'
                    onClick={() => handleDateSelect(date)}
                    className={`
                      p-2 text-sm rounded-lg transition-colors
                      ${
                  !isCurrentMonth
                    ? 'text-gray-300 hover:bg-gray-50'
                    : isSelectedDate
                      ? 'bg-gray-900 text-white'
                      : isTodayDate
                        ? 'bg-blue-100 text-blue-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                  }
                    `}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className='flex justify-between mt-4 pt-3 border-t border-gray-100'>
              <button
                type='button'
                onClick={() => handleDateSelect(new Date())}
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
              >
                Today
              </button>
              <button
                type='button'
                onClick={() => {
                  setSelectedDate(null)
                  onChange('')
                  setIsOpen(false)
                }}
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className='flex items-center mt-1 text-sm text-red-600'>
          <AlertCircle className='w-4 h-4 mr-1' />
          {error}
        </div>
      )}
    </div>
  )
}

export default DatePicker
