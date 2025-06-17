import React from 'react'
import Checkbox from './Checkbox'

interface CheckboxOption {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  value: string;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (selectedValues: string[]) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'rounded';
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  'aria-label'?: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  selectedValues,
  onChange,
  label,
  description,
  size = 'md',
  variant = 'default',
  disabled = false,
  className = '',
  orientation = 'vertical',
  'aria-label': ariaLabel
}) => {
  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, value])
    } else {
      onChange(selectedValues.filter(v => v !== value))
    }
  }

  const groupId = `checkbox-group-${Math.random().toString(36).substr(2, 9)}`
  const descriptionId = description ? `${groupId}-description` : undefined

  return (
    <div className={className}>
      {/* Group label */}
      {label && (
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-900" id={groupId}>
            {label}
          </div>
          {description && (
            <div className="mt-1 text-xs text-gray-600" id={descriptionId}>
              {description}
            </div>
          )}
        </div>
      )}

      {/* Checkbox options */}
      <div
        role="group"
        aria-labelledby={label ? groupId : undefined}
        aria-label={!label ? ariaLabel : undefined}
        aria-describedby={descriptionId}
        className={`
          ${orientation === 'horizontal'
      ? 'flex flex-wrap gap-6'
      : 'space-y-3'
    }
        `}
      >
        {options.map((option) => (
          <Checkbox
            key={option.id}
            id={option.id}
            label={option.label}
            description={option.description}
            checked={selectedValues.includes(option.value)}
            disabled={disabled || option.disabled}
            size={size}
            variant={variant}
            onChange={(checked) => handleCheckboxChange(option.value, checked)}
          />
        ))}
      </div>
    </div>
  )
}

export default CheckboxGroup
