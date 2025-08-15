import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { useTranslation } from './hooks/useTranslation'
import { ErrorBoundary, EnhancedLoadingScreen } from './components/feedback'
import { DashboardLayout } from './components'
import Login from './pages/Login'
import VerifyOTP from './pages/VerifyOTP'
import Unauthorized from './pages/Unauthorized'
import SetupProfile from './pages/SetupProfile'
import AccountCreated from './pages/AccountCreated'

/**
 * Component to handle redirects after login - all dashboard users go to root
 */
const LoginRedirect: React.FC = () => {
  const { profile } = useAuthStore()

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  // All dashboard users (admin, moderator, affiliate) go to root route
  // The dashboard will show appropriate content based on their role
  return <Navigate to="/" replace />
}

/**
 * Component to check if user has dashboard access
 * Blocks users with 'user' role, allows admin, moderator, affiliate
 */
const DashboardAccessCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuthStore()

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  // Block regular 'user' role from dashboard access
  if (profile.role === 'user') {
    return <Navigate to="/unauthorized" replace />
  }

  // Allow admin, moderator, affiliate
  return <>{children}</>
}

function App () {
  const { initialize, initialized, user } = useAuthStore()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

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
        message={t('app.initializingApplication')}
        subtitle={t('app.settingUpDashboard')}
      />
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className='App'>
          <Routes>
            <Route path='/login' element={user ? <LoginRedirect /> : <Login />} />
            <Route path='/verify-otp' element={<VerifyOTP />} />
            <Route path='/unauthorized' element={<Unauthorized />} />
            <Route path='/setup-profile' element={<SetupProfile />} />
            <Route path='/account-created' element={<AccountCreated />} />
            <Route
              path='/*'
              element={
                <DashboardAccessCheck>
                  <DashboardLayout />
                </DashboardAccessCheck>
              }
            />
          </Routes>
          <Toaster
            position='bottom-right'
            theme='light'
            expand={true}
            visibleToasts={4}
            closeButton={true}
            richColors
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 38px -10px rgba(0, 0, 0, 0.35), 0 10px 20px -15px rgba(0, 0, 0, 0.2)',
              },
              className: 'animate-in slide-in-from-bottom-2 duration-300'
            }}
          />
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
