import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { COLORS } from './constants/colors'
import { Z_INDEX } from './constants/spacing'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import EnhancedLoadingScreen from './components/EnhancedLoadingScreen'
import Login from './pages/Login'
import Unauthorized from './pages/Unauthorized'
import DashboardLayout from './components/DashboardLayout'

function App () {
  const { initialize, initialized, user } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialize, initialized])

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
            containerStyle={{
              bottom: '24px',
              right: '24px'
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: COLORS.gray[900],
                color: '#ffffff',
                borderRadius: '12px',
                border: `1px solid ${COLORS.gray[800]}`,
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '400px',
                zIndex: Z_INDEX.toast
              },
              success: {
                duration: 3000,
                style: {
                  background: COLORS.success[600],
                  color: '#ffffff',
                  border: `1px solid ${COLORS.success[700]}`
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: COLORS.success[600]
                }
              },
              error: {
                duration: 5000,
                style: {
                  background: COLORS.error[600],
                  color: '#ffffff',
                  border: `1px solid ${COLORS.error[700]}`
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: COLORS.error[600]
                }
              },
              loading: {
                style: {
                  background: COLORS.info[600],
                  color: '#ffffff',
                  border: `1px solid ${COLORS.info[700]}`
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: COLORS.info[600]
                }
              }
            }}
          />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
