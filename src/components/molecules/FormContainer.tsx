import React from 'react'
import { cn } from '../../utils/theme'

interface FormContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * FormContainer - A simple wrapper component for forms
 * Provides consistent styling and structure without loading overlays
 */
const FormContainer: React.FC<FormContainerProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  )
}

export default FormContainer