import React, { useState, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from '../layout/Sidebar'
import Header from '../layout/Header'
import { ProtectedRoute } from '../common'
import { PageLoadingSpinner } from '../feedback'

// Lazy load page components for code splitting
const Dashboard = React.lazy(() => import('../../pages/Dashboard'))
const Posts = React.lazy(() => import('../../pages/Posts'))
const Brokers = React.lazy(() => import('../../pages/Brokers'))
const Banners = React.lazy(() => import('../../pages/Banners'))
const Users = React.lazy(() => import('../../pages/Users'))
const Settings = React.lazy(() => import('../../pages/Settings'))
const Products = React.lazy(() => import('../../pages/Products'))
const Unauthorized = React.lazy(() => import('../../pages/Unauthorized'))

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className='h-screen bg-gray-50 dark:bg-gray-900 flex flex-col'>
      {/* Header spans full width at top */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar and main content below header */}
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        <main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6'>
          <Suspense fallback={<PageLoadingSpinner message='Loading page...' />}>
            <Routes>
              <Route path='/' element={<Dashboard />} />

              <Route
                path='/posts'
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'posts', action: 'read' }}>
                    <Posts />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/products'
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'products', action: 'read' }}>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/brokers'
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'brokers', action: 'read' }}>
                    <Brokers />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/banners'
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'banners', action: 'read' }}>
                    <Banners />
                  </ProtectedRoute>
                }
              />
              <Route
                path='/users'
                element={
                  <ProtectedRoute requiredPermission={{ resource: 'users', action: 'read' }}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route path='/settings' element={<Settings />} />

              <Route path='/unauthorized' element={<Unauthorized />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
