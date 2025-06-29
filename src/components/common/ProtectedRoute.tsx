import React, { memo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { usePermissions } from '../../hooks/usePermissions'
import { useTranslation } from '../../hooks/useTranslation'
import { EnhancedLoadingScreen } from '../feedback'
import type { UserRole } from '../../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: {
    resource: string
    action: string
  }
  redirectTo?: string
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = memo(
  ({ children, requiredRole, requiredPermission, redirectTo = '/login' }) => {
    const { user, profile, loading: authLoading, initialized } = useAuthStore()
    const { can, hasRole, loading: permissionsLoading } = usePermissions()
    const { t } = useTranslation()

    if (!initialized || authLoading || permissionsLoading) {
      return (
        <EnhancedLoadingScreen
          message={t('auth.authenticating')}
          subtitle={t('auth.verifyingCredentials')}
        />
      )
    }

    if (!user || !profile) {
      return <Navigate to={redirectTo} replace />
    }

    // Check role-based access
    if (requiredRole && !hasRole(requiredRole)) {
      // If user doesn't have the required role, check if they're an admin
      if (requiredRole !== 'super_admin' && (hasRole('admin') || hasRole('super_admin'))) {
        // Admins and super admins can access most things
      } else {
        return <Navigate to='/unauthorized' replace />
      }
    }

    // Check permission-based access
    if (requiredPermission && !can(requiredPermission.resource, requiredPermission.action)) {
      return <Navigate to='/unauthorized' replace />
    }

    return <>{children}</>
  }
)

export default ProtectedRoute
