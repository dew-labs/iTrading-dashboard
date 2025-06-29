import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from '../layout/Sidebar'
import Header from '../layout/Header'
import { ProtectedRoute } from '../common'
import Dashboard from '../../pages/Dashboard'
import Posts from '../../pages/Posts'
import Brokers from '../../pages/Brokers'
import Banners from '../../pages/Banners'
import Users from '../../pages/Users'
import Settings from '../../pages/Settings'
import Unauthorized from '../../pages/Unauthorized'

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
            {/* Products page hidden - route commented out */}
            {/* <Route
              path='/products'
              element={
                <ProtectedRoute requiredPermission={{ resource: 'products', action: 'read' }}>
                  <Products />
                </ProtectedRoute>
              }
            /> */}
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
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
