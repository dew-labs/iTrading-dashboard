import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.tsx'
import './index.css'
import './lib/i18n'
import { initializeTheme } from './store/themeStore'

// Initialize theme on app startup
initializeTheme()

// Create a query client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes after component unmounts
      gcTime: 10 * 60 * 1000,
      // Enable background refetch
      refetchOnWindowFocus: false,
      // Retry failed queries 2 times
      retry: (failureCount, error) => {
        // Don't retry auth errors to prevent infinite loops
        const errorMessage =
          error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
        if (
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('forbidden') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('expired') ||
          errorMessage.includes('no rows found')
        ) {
          return false
        }
        return failureCount < 2
      },
      // Retry delay increases exponentially
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      // Retry failed mutations once
      retry: (failureCount, error) => {
        // Don't retry auth errors for mutations either
        const errorMessage =
          error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
        if (
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('forbidden') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('expired')
        ) {
          return false
        }
        return failureCount < 1
      }
    }
  }
})

// Global error handler for auth issues
queryClient.setMutationDefaults(['auth-error'], {
  onError: error => {
    const errorMessage =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
    if (
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('forbidden') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('jwt') ||
      errorMessage.includes('expired')
    ) {
      console.warn('Global auth error detected, user session may be invalid:', error)
      // The auth store will handle the actual sign out
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
