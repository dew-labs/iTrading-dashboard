import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Bug, FileX } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId?: string
}

class ErrorBoundary extends Component<Props, State> {
  private initialState: State = {
    hasError: false
  }

  public override state: State = this.initialState

  public static getDerivedStateFromError (error: Error): State {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId
    }
  }

  public override componentDidCatch (error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props

    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    console.error('ErrorBoundary caught an error:', errorDetails)

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }

    // Store error details for debugging
    this.setState({ errorInfo })

    // In production, you could send this to an error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    if (import.meta.env.PROD) {
      // errorReportingService.captureException(error, errorDetails)
    }
  }

  private resetError = () => {
    this.setState(this.initialState)
  }

  private getErrorType = () => {
    if (!this.state.error) return 'unknown'

    const message = this.state.error.message.toLowerCase()

    if (message.includes('chunk') || message.includes('loading')) {
      return 'chunk'
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network'
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'auth'
    }
    return 'generic'
  }

  private getErrorIcon = () => {
    const errorType = this.getErrorType()

    switch (errorType) {
    case 'chunk':
      return <FileX className='w-8 h-8 text-orange-600 dark:text-orange-400' />
    case 'network':
      return <AlertTriangle className='w-8 h-8 text-yellow-600 dark:text-yellow-400' />
    case 'auth':
      return <AlertTriangle className='w-8 h-8 text-red-600 dark:text-red-400' />
    default:
      return <Bug className='w-8 h-8 text-red-600 dark:text-red-400' />
    }
  }

  private getErrorMessage = () => {
    const errorType = this.getErrorType()

    switch (errorType) {
    case 'chunk':
      return {
        title: 'Update Available',
        description: 'A new version of the application is available. Please refresh the page to load the latest version.'
      }
    case 'network':
      return {
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection and try again.'
      }
    case 'auth':
      return {
        title: 'Authentication Error',
        description: 'There was an issue with your session. Please sign in again.'
      }
    default:
      return {
        title: 'Something went wrong',
        description: 'We\'re sorry, but something unexpected happened. Our team has been notified.'
      }
    }
  }

  public override render () {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { title, description } = this.getErrorMessage()
      const errorType = this.getErrorType()

      return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center'>
            <div className='w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              {this.getErrorIcon()}
            </div>

            <h1 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              {title}
            </h1>

            <p className='text-gray-600 dark:text-gray-300 mb-6'>
              {description}
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className='bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left'>
                <summary className='cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2'>
                  Technical Details (Development)
                </summary>
                <div className='text-xs font-mono text-gray-700 dark:text-gray-300 space-y-2'>
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Error ID:</strong> {this.state.errorId}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className='whitespace-pre-wrap text-xs mt-1'>
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className='flex space-x-3'>
              <button
                onClick={this.resetError}
                className='flex-1 flex items-center justify-center px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
              >
                <RefreshCw className='w-4 h-4 mr-2' />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
              >
                {errorType === 'chunk' ? 'Update App' : 'Refresh Page'}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
