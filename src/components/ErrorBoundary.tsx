import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  }

  public static getDerivedStateFromError (error: Error): State {
    return { hasError: true, error }
  }

  public override componentDidCatch (error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  private resetError = () => {
    this.setState({ hasError: false })
  }

  public override render () {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center'>
            <div className='w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <AlertTriangle className='w-8 h-8 text-red-600 dark:text-red-400' />
            </div>

            <h1 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>Something went wrong</h1>

            <p className='text-gray-600 dark:text-gray-300 mb-6'>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left'>
                <p className='text-sm font-mono text-gray-800 dark:text-gray-200'>{this.state.error.message}</p>
              </div>
            )}

            <div className='flex space-x-3'>
              <button
                onClick={this.resetError}
                className='flex-1 flex items-center justify-center px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors'
              >
                <RefreshCw className='w-4 h-4 mr-2' />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
              >
                Refresh Page
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
