import { toast as sonnerToast } from 'sonner'
import { CheckCircle, XCircle, Info, Loader2 } from 'lucide-react'
import React from 'react'

/**
 * Enhanced Toast utilities with custom Lucide icons and colors
 * Built on top of Sonner's smooth animations
 */

export const toast = {
  /**
   * Show a success toast with green styling and checkmark icon
   */
  success: (message: string) => {
    sonnerToast.success(message, {
      icon: React.createElement(CheckCircle, {
        className: 'w-5 h-5 text-green-500'
      }),
      style: {
        background: 'white',
        border: '1px solid #bbf7d0',
        color: '#1f2937'
      },
      className: 'success-toast'
    })
  },

  /**
   * Show an error toast with red styling and X icon
   */
  error: (message: string, options?: {duration?: number}) => {
    sonnerToast.error(message, {
      icon: React.createElement(XCircle, {
        className: 'w-5 h-5 text-red-500'
      }),
      duration: options?.duration || 5000,
      style: {
        background: 'white',
        border: '1px solid #fecaca',
        color: '#1f2937'
      },
      className: 'error-toast'
    })
  },

  /**
   * Show an info toast with blue styling and info icon
   */
  info: (message: string) => {
    sonnerToast.info(message, {
      icon: React.createElement(Info, {
        className: 'w-5 h-5 text-blue-500'
      }),
      style: {
        background: 'white',
        border: '1px solid #bfdbfe',
        color: '#1f2937'
      },
      className: 'info-toast'
    })
  },

  /**
   * Show a loading toast with yellow styling and spinning loader
   * Returns the toast ID for manual dismissal
   */
  loading: (message: string) => {
    sonnerToast.loading(message, {
      icon: React.createElement(Loader2, {
        className: 'w-5 h-5 text-yellow-500'
      }),
      style: {
        background: 'white',
        border: '1px solid #fef3c7',
        color: '#1f2937'
      },
      className: 'loading-toast'
    })
  },

  /**
   * Dismiss a specific toast by ID
   */
  dismiss: (id?: string | number) => {
    sonnerToast.dismiss(id)
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    sonnerToast.dismiss()
  }
}

export default toast
