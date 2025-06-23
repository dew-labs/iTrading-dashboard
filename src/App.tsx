import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import EnhancedLoadingScreen from './components/EnhancedLoadingScreen'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import DashboardLayout from './components/DashboardLayout'

function App () {
  const { initialize, initialized, user } = useAuthStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    // Provide cache clearing function to auth store
    useAuthStore.setState({
      clearUserCache: () => {
        console.warn('Clearing React Query cache due to auth state change')
        queryClient.clear()
      }
    })

    if (!initialized) {
      initialize()
    }
  }, [initialize, initialized, queryClient])

  if (!initialized) {
    return (
      <EnhancedLoadingScreen
        message="Initializing Application"
        subtitle="Setting up your dashboard experience..."
      />
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster
            position="bottom-right"
            theme="light"
            expand={true}
            visibleToasts={4}
            closeButton={true}
          />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
