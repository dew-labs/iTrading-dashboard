import React, { useState, useRef, useEffect, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Menu,
  Bell,
  ChevronDown,
  Users,
  FileText,
  Package,
  Activity,
  Clock,
  LogOut,
  Settings
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useTranslation, useNotificationTranslation } from '../../hooks/useTranslation'
import { Badge } from '../ui'
import { Avatar } from '../features/users'

interface HeaderProps {
  onToggleSidebar: () => void
}

interface NotificationItem {
  id: number
  type: 'user' | 'post' | 'product' | 'banner' | 'system'
  action: string
  user: string
  timestamp: string
  details?: string
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, profile, signOut } = useAuthStore()
  const { t } = useTranslation()
  const { t: tNotifications } = useNotificationTranslation()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Mock recent activity data - memoized to prevent recreating on every render
  const recentNotifications: NotificationItem[] = useMemo(
    () => [
      {
        id: 1,
        type: 'user',
        action: 'New user registered',
        user: 'Sarah Wilson',
        timestamp: '2 minutes ago',
        details: 'sarah.wilson@company.com'
      },
      {
        id: 2,
        type: 'product',
        action: 'Product updated',
        user: 'Mike Johnson',
        timestamp: '15 minutes ago',
        details: 'Premium Wireless Headphones - Stock updated'
      },
      {
        id: 3,
        type: 'post',
        action: 'News post published',
        user: 'Emma Davis',
        timestamp: '1 hour ago',
        details: 'Company Quarterly Results'
      },
      {
        id: 4,
        type: 'banner',
        action: 'Banner activated',
        user: 'John Smith',
        timestamp: '2 hours ago',
        details: 'Summer Sale Campaign'
      },
      {
        id: 5,
        type: 'system',
        action: 'System backup completed',
        user: 'System',
        timestamp: '3 hours ago',
        details: 'Daily backup successful'
      },
      {
        id: 6,
        type: 'user',
        action: 'User account suspended',
        user: 'Admin',
        timestamp: '4 hours ago',
        details: 'alex.chen@company.com'
      },
      {
        id: 7,
        type: 'product',
        action: 'Low stock alert',
        user: 'System',
        timestamp: '5 hours ago',
        details: 'Smart Fitness Watch - Only 2 items left'
      },
      {
        id: 8,
        type: 'post',
        action: 'Event scheduled',
        user: 'Marketing Team',
        timestamp: '6 hours ago',
        details: 'Annual Conference 2024'
      }
    ],
    []
  )

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setShowProfileDropdown(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
    case 'user':
      return <Users className='w-4 h-4' />
    case 'post':
      return <FileText className='w-4 h-4' />
    case 'product':
      return <Package className='w-4 h-4' />
    case 'banner':
      return <Activity className='w-4 h-4' />
    default:
      return <Bell className='w-4 h-4' />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
    case 'user':
      return 'bg-blue-100 text-blue-600'
    case 'post':
      return 'bg-green-100 text-green-600'
    case 'product':
      return 'bg-purple-100 text-purple-600'
    case 'banner':
      return 'bg-teal-100 text-teal-600'
    default:
      return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <header className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 relative z-10'>
      <div className='flex items-center justify-between h-20 px-6'>
        <div className='flex items-center'>
          <button
            onClick={onToggleSidebar}
            className='lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
          >
            <Menu className='w-5 h-5 text-gray-600 dark:text-gray-300' />
          </button>

          {/* Logo */}
          <div className='ml-4 lg:ml-0 flex items-center'>
            <div className='flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg'>
              <span className='text-white font-bold text-lg'>i</span>
            </div>
            <div className='ml-3'>
              <h1 className='text-xl font-bold text-gray-900 dark:text-white'>iTrading</h1>
            </div>
          </div>
        </div>

        <div className='flex items-center space-x-3'>
          {/* Notifications */}
          <div className='relative' ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className='relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all group'
            >
              <Bell className='w-5 h-5' />
              <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse'></span>
              <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping'></span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className='absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-96 overflow-hidden'>
                {/* Header */}
                <div className='px-4 py-3 border-b border-gray-100 dark:border-gray-700'>
                  <div className='flex items-center justify-between'>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      {tNotifications('recentActivity')}
                    </h3>
                    <span className='text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full'>
                      {tNotifications('newNotifications', { count: recentNotifications.length })}
                    </span>
                  </div>
                </div>

                {/* Notifications List */}
                <div className='max-h-80 overflow-y-auto'>
                  {recentNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className='px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-b-0'
                    >
                      <div className='flex items-start space-x-3'>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                            notification.type
                          )}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between'>
                            <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                              {notification.action}
                            </p>
                            <div className='flex items-center text-xs text-gray-500 dark:text-gray-400 ml-2'>
                              <Clock className='w-3 h-3 mr-1' />
                              {notification.timestamp}
                            </div>
                          </div>
                          <p className='text-xs text-gray-600 dark:text-gray-300 mt-1'>by {notification.user}</p>
                          {notification.details && (
                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 truncate'>
                              {notification.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className='px-4 py-3 border-t border-gray-100 dark:border-gray-700'>
                  <button className='w-full text-sm text-gray-900 dark:text-white hover:text-black dark:hover:text-gray-200 font-medium text-center'>
                    {tNotifications('viewAll')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className='w-px h-8 bg-gray-200 dark:bg-gray-700 mx-4'></div>

          {/* User Profile Dropdown */}
          <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className='flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 py-3 px-4 group'
            >
              <div className='hidden sm:block text-right min-w-0'>
                <p className='text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors'>
                  {user?.user_metadata?.full_name || profile?.full_name || t('roles.user')}
                </p>
                <div className='flex items-center justify-end'>
                  {profile?.role && (
                    <Badge
                      variant={profile.role as 'admin' | 'user' | 'super_admin'}
                      size='sm'
                      showIcon
                    >
                      {t(
                        profile.role === 'super_admin'
                          ? 'roles.superAdmin'
                          : `roles.${profile.role}`
                      )}
                    </Badge>
                  )}
                </div>
              </div>

              <Avatar
                src={profile?.avatar_url ?? null}
                alt={`${profile?.full_name || user?.email} avatar`}
                size='md'
                fallback={user?.email?.charAt(0).toUpperCase() || 'U'}
                clickable
                showOnline
                className='group-hover:rotate-3'
              />

              <ChevronDown
                className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-all duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300 ${
                  showProfileDropdown ? 'rotate-180 text-teal-500' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className='absolute right-0 mt-2 w-66 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50'>
                {/* User Info Section */}
                <div className='px-4 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800'>
                  <div className='flex items-center space-x-4'>
                    <Avatar
                      src={profile?.avatar_url ?? null}
                      alt={`${profile?.full_name || user?.email} avatar`}
                      size='lg'
                      fallback={user?.email?.charAt(0).toUpperCase() || 'U'}
                      showOnline
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='font-semibold text-gray-900 dark:text-white truncate text-base'>
                        {user?.user_metadata?.full_name || profile?.full_name || t('roles.user')}
                      </p>
                      <p className='text-sm text-gray-500 dark:text-gray-400 truncate'>{user?.email}</p>
                      <div className='mt-1'>
                        {profile?.role && (
                          <Badge
                            variant={profile.role as 'admin' | 'user' | 'super_admin'}
                            size='md'
                            showIcon
                          >
                            {t(
                              profile.role === 'super_admin'
                                ? 'roles.superAdmin'
                                : `roles.${profile.role}`
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className='px-2 py-2'>
                  <NavLink
                    to='/settings'
                    onClick={() => setShowProfileDropdown(false)}
                    className='w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors'
                  >
                    <Settings className='w-4 h-4 mr-3' />
                    Account Settings
                  </NavLink>
                </div>

                {/* Divider */}
                <div className='border-t border-gray-100 dark:border-gray-700 my-2'></div>

                {/* Logout */}
                <div className='px-2'>
                  <button
                    onClick={handleSignOut}
                    className='w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group'
                  >
                    <LogOut className='w-4 h-4 mr-3 group-hover:scale-110 transition-transform' />
                    {t('auth.signOut')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
