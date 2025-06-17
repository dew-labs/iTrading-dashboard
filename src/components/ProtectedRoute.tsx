import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { user, loading, initialized } = useAuthStore()

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Role-based access control would be implemented here
  // For now, we'll allow all authenticated users
  if (requiredRole) {
    // This would check user role from database
    // const userRole = await getUserRole(user.id);
    // if (!hasPermission(userRole, requiredRole)) {
    //   return <Navigate to="/unauthorized" replace />;
    // }
  }

  return <>{children}</>
}

export default ProtectedRoute
