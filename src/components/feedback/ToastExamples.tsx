import React from 'react'
import { useToast } from '../../hooks/useToast'
import { getButtonClasses } from '../../utils/theme'

/**
 * Toast Examples Component
 *
 * This component demonstrates how to use the new translated toast system
 * with consistent icons and messages across different languages.
 */
const ToastExamples: React.FC = () => {
  const toast = useToast()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Toast System Examples
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Demonstration of the new translated toast system with consistent icons and messages.
        </p>
      </div>

      {/* Success Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Success Toasts</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => toast.success('created', 'user')}
            className={getButtonClasses('primary', 'sm')}
          >
            User Created
          </button>
          <button
            onClick={() => toast.success('updated', 'product')}
            className={getButtonClasses('primary', 'sm')}
          >
            Product Updated
          </button>
          <button
            onClick={() => toast.success('deleted', 'post')}
            className={getButtonClasses('primary', 'sm')}
          >
            Post Deleted
          </button>
        </div>
      </div>

      {/* Error Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Toasts</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => toast.error('unauthorized')}
            className={getButtonClasses('danger', 'sm')}
          >
            Unauthorized
          </button>
          <button
            onClick={() => toast.error('validation')}
            className={getButtonClasses('danger', 'sm')}
          >
            Validation Error
          </button>
          <button
            onClick={() => toast.error(null, null, 'Custom error message')}
            className={getButtonClasses('danger', 'sm')}
          >
            Custom Message
          </button>
        </div>
      </div>
    </div>
  )
}

export default ToastExamples
