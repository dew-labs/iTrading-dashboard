import React from 'react'
import { AlertTriangle, Trash2, AlertCircle } from 'lucide-react'
import { getButtonClasses, getTypographyClasses, cn } from '../utils/theme'

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  variant?: 'warning' | 'danger' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  variant = isDestructive ? 'danger' : 'warning'
}) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
    case 'danger':
      return {
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        icon: Trash2
      }
    case 'warning':
      return {
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        icon: AlertTriangle
      }
    case 'info':
      return {
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        icon: AlertCircle
      }
    default:
      return {
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        icon: AlertTriangle
      }
    }
  }

  const { iconBg, iconColor, icon: Icon } = getVariantStyles()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      {/* Enhanced background overlay */}
      <div
        className="fixed inset-0 backdrop-blur-md bg-black/30 transition-all duration-300 ease-out"
        onClick={handleBackdropClick}
      />

      {/* Dialog container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Dialog panel */}
        <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300 ease-out scale-100">
          <div className="p-6">
            {/* Icon and content */}
            <div className="flex items-start">
              <div
                className={cn(
                  'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl shadow-sm',
                  iconBg,
                  'sm:mx-0 sm:h-10 sm:w-10'
                )}
              >
                <Icon className={cn('h-6 w-6', iconColor)} />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>
                  {title}
                </h3>
                <div className="mt-2">
                  <p className={getTypographyClasses('small')}>{message}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
              <button
                type="button"
                className={cn(getButtonClasses('secondary', 'md'), 'w-full sm:w-auto')}
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={cn(
                  getButtonClasses(isDestructive ? 'danger' : 'primary', 'md'),
                  'w-full sm:w-auto',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
