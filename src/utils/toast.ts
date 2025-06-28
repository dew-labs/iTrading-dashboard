import { toast as sonnerToast } from 'sonner'
import { CheckCircle, XCircle, Info, Loader2 } from 'lucide-react'
import React from 'react'
import i18n from '../lib/i18n'

/**
 * Enhanced Toast utilities with custom Lucide icons and colors
 * Built on top of Sonner's smooth animations
 *
 * Note: For component usage, prefer useToast hook for better translation support
 * This utility is mainly for stores and non-component contexts
 */

/**
 * Get translated message with fallback
 */
const getTranslatedMessage = (key: string, fallback: string): string => {
  try {
    const translated = i18n.t(key, { ns: 'notifications' })
    return translated !== key ? translated : fallback
  } catch {
    return fallback
  }
}

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
   * Translated error messages for common cases
   */
  errorTranslated: {
    sessionExpired: () => toast.error(getTranslatedMessage('toast.error.sessionExpired', 'Your session has expired. Please sign in again.')),
    accountRemoved: () => toast.error(getTranslatedMessage('toast.error.accountRemoved', 'Your account has been removed. Please contact your administrator.')),
    authError: () => toast.error(getTranslatedMessage('toast.error.unauthorized', 'Authentication error. Please sign in again.')),
    general: () => toast.error(getTranslatedMessage('toast.error.general', 'Something went wrong. Please try again.'))
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
