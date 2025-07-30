import { useTranslation } from './useTranslation'
import { toast as sonnerToast } from 'sonner'
import { CheckCircle, XCircle, Info, Loader2, AlertTriangle } from 'lucide-react'
import React from 'react'

/**
 * Toast type definitions for type safety
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading'

export type EntityType =
  | 'user' | 'users'
  | 'post' | 'posts'
  | 'product' | 'products'
  | 'broker' | 'brokers'
  | 'banner' | 'banners'
  | 'image' | 'images'
  | 'permission' | 'permissions'
  | 'role' | 'avatar' | 'mainImage'
  | 'accountType'

export type SuccessAction =
  | 'general' | 'saved' | 'created' | 'updated' | 'deleted'
  | 'uploaded' | 'downloaded' | 'published' | 'activated'
  | 'deactivated' | 'invited' | 'granted' | 'revoked'
  | 'restored' | 'duplicated'

export type ErrorType =
  | 'general' | 'failed' | 'notFound' | 'unauthorized'
  | 'validation' | 'network' | 'timeout' | 'fileSize'
  | 'fileType' | 'required' | 'invalidFormat'
  | 'alreadyExists' | 'sessionExpired' | 'accountRemoved'
  | 'unexpectedError'

export type InfoType =
  | 'loading' | 'processing' | 'saving' | 'uploading'
  | 'downloading' | 'waiting' | 'maintenance'

export interface ToastOptions {
  duration?: number
  action?: React.ReactNode
  dismissible?: boolean
}

/**
 * Enhanced Toast Hook with translation support and consistent styling
 *
 * @example
 * ```tsx
 * const toast = useToast()
 *
 * // Simple success
 * toast.success('created') // Uses translation: "Created successfully"
 *
 * // Success with entity
 * toast.success('created', 'user') // "User created successfully"
 *
 * // Error with custom message
 * toast.error('validation') // Uses translation: "Please check your input..."
 *
 * // Custom message (not translated)
 * toast.error(null, null, 'Custom error message')
 *
 * // Loading state
 * const loadingId = toast.loading('uploading')
 * // Later dismiss it
 * toast.dismiss(loadingId)
 * ```
 */
export const useToast = () => {
  const { t } = useTranslation('notifications')

  const getToastIcon = (type: ToastType) => {
    const iconProps = { className: 'w-5 h-5' }

    switch (type) {
    case 'success':
      return React.createElement(CheckCircle, { ...iconProps, className: `${iconProps.className} text-green-500` })
    case 'error':
      return React.createElement(XCircle, { ...iconProps, className: `${iconProps.className} text-red-500` })
    case 'warning':
      return React.createElement(AlertTriangle, { ...iconProps, className: `${iconProps.className} text-yellow-500` })
    case 'info':
      return React.createElement(Info, { ...iconProps, className: `${iconProps.className} text-blue-500` })
    case 'loading':
      return React.createElement(Loader2, { ...iconProps, className: `${iconProps.className} text-yellow-500 animate-spin` })
    default:
      return React.createElement(Info, iconProps)
    }
  }

  const getToastStyle = (type: ToastType) => {
    const baseStyle = {
      background: 'white',
      color: '#1f2937'
    }

    switch (type) {
    case 'success':
      return { ...baseStyle, border: '1px solid #bbf7d0' }
    case 'error':
      return { ...baseStyle, border: '1px solid #fecaca' }
    case 'warning':
      return { ...baseStyle, border: '1px solid #fef3c7' }
    case 'info':
    case 'loading':
      return { ...baseStyle, border: '1px solid #bfdbfe' }
    default:
      return baseStyle
    }
  }

  const buildMessage = (
    action: SuccessAction | ErrorType | InfoType | null,
    entity: EntityType | null = null,
    customMessage: string | null = null
  ): string => {
    if (customMessage) return customMessage

    if (!action) return t('toast.error.general')

    const actionText = t(`toast.success.${action}` as const) ||
                     t(`toast.error.${action}` as const) ||
                     t(`toast.info.${action}` as const)

    if (!entity) return actionText

    const entityText = t(`toast.entities.${entity}` as const)

    // For success actions, format as "Entity created successfully"
    if (action === 'created' || action === 'updated' || action === 'deleted' || action === 'granted' || action === 'revoked') {
      return `${entityText} ${actionText.toLowerCase()}`
    }

    return `${entityText} ${actionText}`
  }

  const showToast = (
    type: ToastType,
    action: SuccessAction | ErrorType | InfoType | null = null,
    entity: EntityType | null = null,
    customMessage: string | null = null,
    options: ToastOptions = {}
  ) => {
    const message = buildMessage(action, entity, customMessage)
    const icon = getToastIcon(type)
    const style = getToastStyle(type)

    const toastOptions = {
      icon,
      style,
      duration: options.duration || (type === 'error' ? 5000 : 4000),
      action: options.action,
      dismissible: options.dismissible !== false,
      className: `${type}-toast`
    }

    switch (type) {
    case 'success':
      return sonnerToast.success(message, toastOptions)
    case 'error':
      return sonnerToast.error(message, toastOptions)
    case 'warning':
      return sonnerToast.error(message, toastOptions) // Sonner doesn't have warning, use error styling
    case 'info':
      return sonnerToast.info(message, toastOptions)
    case 'loading':
      return sonnerToast.loading(message, toastOptions)
    default:
      return sonnerToast(message, toastOptions)
    }
  }

  return {
    /**
     * Show success toast
     * @param action - Success action type or null for custom message
     * @param entity - Entity type (optional)
     * @param customMessage - Custom message (overrides translation)
     * @param options - Additional toast options
     */
    success: (
      action: SuccessAction | null = 'general',
      entity: EntityType | null = null,
      customMessage: string | null = null,
      options: ToastOptions = {}
    ) => showToast('success', action, entity, customMessage, options),

    /**
     * Show error toast
     * @param action - Error type or null for custom message
     * @param entity - Entity type (optional)
     * @param customMessage - Custom message (overrides translation)
     * @param options - Additional toast options
     */
    error: (
      action: ErrorType | null = 'general',
      entity: EntityType | null = null,
      customMessage: string | null = null,
      options: ToastOptions = {}
    ) => showToast('error', action, entity, customMessage, options),

    /**
     * Show warning toast
     * @param action - Warning type or null for custom message
     * @param entity - Entity type (optional)
     * @param customMessage - Custom message (overrides translation)
     * @param options - Additional toast options
     */
    warning: (
      action: ErrorType | null = 'general',
      entity: EntityType | null = null,
      customMessage: string | null = null,
      options: ToastOptions = {}
    ) => showToast('warning', action, entity, customMessage, options),

    /**
     * Show info toast
     * @param action - Info type or null for custom message
     * @param entity - Entity type (optional)
     * @param customMessage - Custom message (overrides translation)
     * @param options - Additional toast options
     */
    info: (
      action: InfoType | null = 'loading',
      entity: EntityType | null = null,
      customMessage: string | null = null,
      options: ToastOptions = {}
    ) => showToast('info', action, entity, customMessage, options),

    /**
     * Show loading toast
     * @param action - Loading type or null for custom message
     * @param entity - Entity type (optional)
     * @param customMessage - Custom message (overrides translation)
     * @param options - Additional toast options
     * @returns Toast ID for manual dismissal
     */
    loading: (
      action: InfoType | null = 'loading',
      entity: EntityType | null = null,
      customMessage: string | null = null,
      options: ToastOptions = {}
    ) => showToast('loading', action, entity, customMessage, options),

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
    },

    /**
     * Promise-based toast for async operations
     * @param promise - Promise to track
     * @param messages - Messages for different states
     */
    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: Error | unknown) => string)
      }
    ) => {
      return sonnerToast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
        style: getToastStyle('info')
      })
    }
  }
}

export default useToast
