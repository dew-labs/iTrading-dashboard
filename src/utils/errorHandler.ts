import { toast } from './toast'

interface ErrorContext {
  feature?: string
  action?: string
  userId?: string
  metadata?: Record<string, unknown>
}

interface ErrorDetails {
  message: string
  stack?: string
  timestamp: string
  context: ErrorContext
  errorId: string
  userAgent: string
  url: string
}

class ErrorHandler {
  private static instance: ErrorHandler

  public static getInstance (): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  private constructor () {
    this.setupGlobalErrorHandlers()
  }

  private setupGlobalErrorHandlers (): void {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        feature: 'global',
        action: 'unhandled_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          feature: 'global',
          action: 'unhandled_promise_rejection'
        }
      )
    })
  }

  public logError (error: Error, context: ErrorContext = {}): string {
    const errorId = this.generateErrorId()

    const errorDetails: ErrorDetails = {
      message: error.message,
      ...(error.stack && { stack: error.stack }),
      timestamp: new Date().toISOString(),
      context,
      errorId,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('🚨 Error Handler:', errorDetails)
    }

    // Store in sessionStorage for debugging
    this.storeErrorLocally(errorDetails)

    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      this.reportError(errorDetails)
    }

    return errorId
  }

  public logApiError (
    error: Error,
    endpoint: string,
    method: string,
    context: ErrorContext = {}
  ): string {
    return this.logError(error, {
      ...context,
      feature: context.feature || 'api',
      action: context.action || 'request_failed',
      metadata: {
        ...context.metadata,
        endpoint,
        method
      }
    })
  }

  public handleUserFriendlyError (
    error: Error,
    context: ErrorContext = {},
    showToast = true
  ): string {
    const errorId = this.logError(error, context)

    if (showToast) {
      const userMessage = this.getUserFriendlyMessage(error, context)
      toast.error(userMessage)
    }

    return errorId
  }

  private getUserFriendlyMessage (error: Error, context: ErrorContext): string {
    const message = error.message.toLowerCase()

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('jwt') || message.includes('expired')) {
      return 'Your session has expired. Please sign in again.'
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'Unable to connect to the server. Please check your internet connection.'
    }

    // Permission errors
    if (message.includes('forbidden') || message.includes('permission')) {
      return 'You don\'t have permission to perform this action.'
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return 'Please check your input and try again.'
    }

    // File upload errors
    if (context.feature === 'upload' || message.includes('file') || message.includes('upload')) {
      return 'File upload failed. Please try again with a different file.'
    }

    // Database errors
    if (message.includes('database') || message.includes('query') || message.includes('sql')) {
      return 'Unable to save your changes. Please try again.'
    }

    // Generic error
    return 'Something went wrong. Please try again or contact support if the problem persists.'
  }

  private generateErrorId (): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private storeErrorLocally (errorDetails: ErrorDetails): void {
    try {
      const existingErrors = this.getStoredErrors()
      existingErrors.push(errorDetails)

      // Keep only last 20 errors
      const recentErrors = existingErrors.slice(-20)

      sessionStorage.setItem('app_errors', JSON.stringify(recentErrors))
    } catch (_e) {
      // Ignore storage errors
      console.warn('Failed to store error locally:', _e)
    }
  }

  private getStoredErrors (): ErrorDetails[] {
    try {
      const stored = sessionStorage.getItem('app_errors')
      return stored ? JSON.parse(stored) : []
    } catch (_e) {
      return []
    }
  }

  private reportError (errorDetails: ErrorDetails): void {
    // In a real application, you would send this to your error reporting service
    // Examples: Sentry, LogRocket, Bugsnag, Rollbar, etc.

    // Example implementation:
    /*
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorDetails)
    }).catch(() => {
      // Silently fail if error reporting fails
    })
    */

    console.warn('Error reporting not implemented. Error details:', errorDetails)
  }

  // Public method to get recent errors for debugging
  public getRecentErrors (): ErrorDetails[] {
    return this.getStoredErrors()
  }

  // Clear stored errors
  public clearStoredErrors (): void {
    try {
      sessionStorage.removeItem('app_errors')
    } catch (_e) {
      // Ignore
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Export utility functions
export const logError = (error: Error, context?: ErrorContext) =>
  errorHandler.logError(error, context)

export const logApiError = (error: Error, endpoint: string, method: string, context?: ErrorContext) =>
  errorHandler.logApiError(error, endpoint, method, context)

export const handleUserFriendlyError = (error: Error, context?: ErrorContext, showToast?: boolean) =>
  errorHandler.handleUserFriendlyError(error, context, showToast)

export default errorHandler
