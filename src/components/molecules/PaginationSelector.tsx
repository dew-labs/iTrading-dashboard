/**
 * PaginationSelector Component
 *
 * A reusable component that allows users to select how many items they want to see per page.
 * Integrates with the theme system for consistent styling and uses predefined pagination options.
 *
 * Features:
 * - Dropdown with predefined options (2, 10, 25, 50, 100)
 * - Shows total item count
 * - Resets to first page when changed
 * - Consistent styling with theme system
 * - Accessible with proper labeling
 * - Includes 2-item option for testing pagination
 */
import React from 'react'
import { API } from '../../constants/theme'
import { cn } from '../../utils/theme'
import { useTranslation } from '../../hooks/useTranslation'
import Select from './Select'

interface PaginationSelectorProps {
  /** Current number of items per page */
  value: number
  /** Callback when the selection changes */
  onChange: (value: number) => void
  /** Additional CSS classes */
  className?: string
  /** Label text before the selector */
  label?: string
}

const PaginationSelector: React.FC<PaginationSelectorProps> = ({
  value,
  onChange,
  className,
  label
}) => {
  const { t: tCommon } = useTranslation('common')
  // Ensure the current value is valid, fallback to default if not
  const validValue = (API.pagination.options as readonly number[]).includes(value)
    ? value
    : API.pagination.defaultLimit

  // Convert pagination options to Select component format
  const selectOptions = API.pagination.options.map(option => ({
    value: option.toString(),
    label: option.toString()
  }))

  const handleSelectChange = (stringValue: string) => {
    const numericValue = Number(stringValue)
    onChange(numericValue)
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className='text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap'>
        {label || tCommon('pagination.rowsPerPage')}
      </span>
      <div className='min-w-[80px]'>
        <Select
          options={selectOptions}
          value={validValue.toString()}
          onChange={handleSelectChange}
          size='sm'
          variant='default'
          aria-label='Items per page'
        />
      </div>
    </div>
  )
}

export default PaginationSelector
