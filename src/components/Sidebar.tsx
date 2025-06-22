import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, FileText, Package, Image, Users, X, ChevronRight, ChevronLeft } from 'lucide-react'
import { usePermissions } from '../hooks/usePermissions'

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  resource?: string;
  action?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { can } = usePermissions()

  const allMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'posts', label: 'Posts', icon: FileText, path: '/posts', resource: 'posts', action: 'read' },
    { id: 'products', label: 'Products', icon: Package, path: '/products', resource: 'products', action: 'read' },
    { id: 'banners', label: 'Banners', icon: Image, path: '/banners', resource: 'banners', action: 'read' },
    { id: 'users', label: 'Users', icon: Users, path: '/users', resource: 'users', action: 'read' }
  ]

  // Filter menu items based on permissions
  const menuItems = allMenuItems.filter(item => {
    // Dashboard is always visible
    if (!item.resource) return true
    // Check if user has permission to view this resource
    return can(item.resource, item.action || 'read')
  })

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    // Close mobile sidebar when toggling collapse on desktop
    if (window.innerWidth >= 1024) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 backdrop-blur-sm backdrop-opacity-75 bg-white/20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between h-20 px-6 border-b border-gray-200 flex-shrink-0 ${
            isCollapsed ? 'lg:px-4' : ''
          }`}
        >
          <div
            className={`flex items-center transition-all duration-300 ${
              isCollapsed ? 'lg:justify-center lg:w-full' : ''
            }`}
          >
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">i</span>
            </div>
            <span
              className={`ml-3 text-xl font-bold text-gray-900 transition-all duration-300 ${
                isCollapsed ? 'lg:hidden' : ''
              }`}
            >
              iTrading
            </span>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Desktop collapse button - positioned absolutely when collapsed */}
          <button
            onClick={toggleCollapse}
            className={`hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 transition-colors ${
              isCollapsed
                ? 'absolute -right-3 top-1/2 transform -translate-y-1/2 bg-white border border-gray-200 shadow-md z-10'
                : ''
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation - flex-1 to take remaining space */}
        <nav
          className={`flex-1 py-6 space-y-2 overflow-y-auto ${isCollapsed ? 'lg:px-2' : 'px-4'}`}
        >
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center text-left rounded-xl transition-all duration-200 ${
                    isCollapsed ? 'lg:justify-center lg:px-3 lg:py-3 px-4 py-3' : 'px-4 py-3'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-lg shadow-gray-900/25'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-900'
                      }`}
                    />

                    <span
                      className={`font-medium transition-all duration-300 ${
                        isCollapsed ? 'lg:hidden ml-3' : 'ml-3'
                      }`}
                    >
                      {item.label}
                    </span>

                    <ChevronRight
                      className={`w-4 h-4 ml-auto transition-transform flex-shrink-0 ${
                        isActive
                          ? 'text-white rotate-90'
                          : 'text-gray-400 group-hover:text-gray-900'
                      } ${isCollapsed ? 'lg:hidden' : ''}`}
                    />

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden lg:block">
                        {item.label}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
