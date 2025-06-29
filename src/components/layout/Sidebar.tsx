import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  FileText,
  Image,
  Users,
  X,
  Pin,
  Building2
} from 'lucide-react'
import { usePermissions } from '../../hooks/usePermissions'
import { useNavigationTranslation } from '../../hooks/useTranslation'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

interface MenuItem {
  id: string
  labelKey: string
  icon: React.ComponentType<{className?: string}>
  path: string
  resource?: string
  action?: string
}

interface MenuSection {
  titleKey: string
  items: MenuItem[]
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { can } = usePermissions()
  const { t } = useNavigationTranslation()

  const menuSections: MenuSection[] = [
    {
      titleKey: 'overview',
      items: [
        { id: 'dashboard', labelKey: 'dashboard', icon: Home, path: '/' }
      ]
    },
    {
      titleKey: 'management',
      items: [
        {
          id: 'posts',
          labelKey: 'posts',
          icon: FileText,
          path: '/posts',
          resource: 'posts',
          action: 'read'
        },
        {
          id: 'brokers',
          labelKey: 'brokers',
          icon: Building2,
          path: '/brokers',
          resource: 'brokers',
          action: 'read'
        },
        {
          id: 'banners',
          labelKey: 'banners',
          icon: Image,
          path: '/banners',
          resource: 'banners',
          action: 'read'
        },
        {
          id: 'users',
          labelKey: 'users',
          icon: Users,
          path: '/users',
          resource: 'users',
          action: 'read'
        }
      ]
    }
  ]

  // Filter menu items based on permissions
  const filteredSections = menuSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Items without resource are always visible
        if (!item.resource) return true
        // Check if user has permission to view this resource
        return can(item.resource, item.action || 'read')
      })
    }))
    .filter(section => section.items.length > 0)

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
          className='fixed inset-0 z-20 backdrop-blur-sm backdrop-opacity-75 bg-black/20 lg:hidden'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-20 bottom-0 left-0 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:top-0 lg:bottom-0 flex flex-col overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72`}
      >
        {/* Mobile close button */}
        <div className='lg:hidden flex justify-end p-4 border-b border-gray-100 dark:border-gray-700'>
          <button
            onClick={() => setIsOpen(false)}
            className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
          >
            <X className='w-5 h-5 text-gray-500 dark:text-gray-400' />
          </button>
        </div>

        {/* Navigation - flex-1 to take remaining space */}
        <nav
          className={`flex-1 py-6 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'lg:px-3' : 'px-6'}`}
        >
          {filteredSections.map((section, sectionIndex) => (
            <div key={section.titleKey} className={sectionIndex > 0 ? 'mt-8' : ''}>
              {/* Section Title */}
              <div className={`mb-4 transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
                <h3 className='text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3'>
                  {t(section.titleKey).toUpperCase()}
                </h3>
              </div>

              {/* Section Items */}
              <div className='space-y-1'>
                {section.items.map(item => {
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
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 hover:text-teal-900 dark:hover:text-teal-200 hover:shadow-sm'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 ${
                              isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-teal-700 dark:group-hover:text-teal-300'
                            }`}
                          />

                          <span
                            className={`font-medium transition-all duration-300 ${
                              isCollapsed ? 'lg:hidden ml-3' : 'ml-3'
                            }`}
                          >
                            {t(item.labelKey)}
                          </span>

                          {/* Active indicator */}
                          {isActive && !isCollapsed && (
                            <div className='ml-auto w-2 h-2 bg-white rounded-full'></div>
                          )}

                          {/* Tooltip for collapsed state */}
                          {isCollapsed && (
                            <div className='absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 hidden lg:block'>
                              {t(item.labelKey)}
                              <div className='absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45'></div>
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pin Button at Bottom */}
        <div className='flex-shrink-0 p-4 border-t border-gray-100 dark:border-gray-700'>
          <div
            className={`flex transition-all duration-300 ease-in-out ${isCollapsed ? 'justify-center' : 'justify-end'}`}
          >
            <button
              onClick={toggleCollapse}
              className='hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Pin
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 ease-in-out ${isCollapsed ? 'rotate-45' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
