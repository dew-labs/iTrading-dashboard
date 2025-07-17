import React, { useState, useRef, useEffect } from 'react'
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
  Settings,
  Building,
  Image,
  Shield,
  ShieldCheck,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useTranslation, useNotificationTranslation } from '../../hooks/useTranslation'
import { useRecentActivity } from '../../hooks/useRecentActivity'
import { Badge } from '../atoms'
import { Avatar } from '../features/users'
import { useThemeStore } from '../../store/themeStore'
import PopoverMenu from '../molecules/PopoverMenu'
import { LANGUAGES } from '../../constants/languages'

interface HeaderProps {
  onToggleSidebar: () => void
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, profile, signOut } = useAuthStore()
  const { t } = useTranslation()
  const { t: tNotifications } = useNotificationTranslation()
  const { recentActivity, loading: activityLoading, hasPermission } = useRecentActivity()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  // useTranslation is already imported; get i18n from it
  // const { t } = useTranslation() // already declared above
  const { i18n } = useTranslation()

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
    case 'users':
      return <Users className='w-4 h-4' />
    case 'posts':
      return <FileText className='w-4 h-4' />
    case 'products':
      return <Package className='w-4 h-4' />
    case 'banners':
      return <Image className='w-4 h-4' />
    case 'brokers':
      return <Building className='w-4 h-4' />
    case 'user_permissions':
      return <Shield className='w-4 h-4' />
    case 'role_permissions':
      return <ShieldCheck className='w-4 h-4' />
    default:
      return <Activity className='w-4 h-4' />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
    case 'users':
      return 'bg-blue-100 text-blue-600'
    case 'posts':
      return 'bg-green-100 text-green-600'
    case 'products':
      return 'bg-purple-100 text-purple-600'
    case 'banners':
      return 'bg-pink-100 text-pink-600'
    case 'brokers':
      return 'bg-orange-100 text-orange-600'
    case 'user_permissions':
    case 'role_permissions':
      return 'bg-red-100 text-red-600'
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
              {hasPermission && recentActivity.length > 0 && (
                <>
                  <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse'></span>
                  <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping'></span>
                </>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className='absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[32rem] flex flex-col'>
                {/* Header */}
                <div className='px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0'>
                  <div className='flex items-center justify-between min-h-[32px]'>
                    <h3 className='font-semibold text-gray-900 dark:text-white leading-none'>
                      {tNotifications('recentActivity')}
                    </h3>
                    {hasPermission && recentActivity.length > 0 && (
                      <span className='text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-medium leading-none flex items-center justify-center min-h-[20px]'>
                        {tNotifications('newNotifications', { count: recentActivity.length })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className='flex-1 overflow-y-auto min-h-0'>
                  {!hasPermission ? (
                    <div className='px-4 py-6 text-center text-gray-500 dark:text-gray-400'>
                      <p>You don't have permission to view recent activity</p>
                    </div>
                  ) : activityLoading ? (
                    <div className='px-4 py-6 text-center text-gray-500 dark:text-gray-400'>
                      <p>Loading recent activity...</p>
                    </div>
                  ) : recentActivity.length === 0 ? (
                    <div className='px-4 py-6 text-center text-gray-500 dark:text-gray-400'>
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    recentActivity.map(notification => (
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
                  ))
                  )}
                </div>

                {/* Footer */}
                <div className='px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0'>
                  <div className='flex justify-center'>
                    <NavLink
                      to='/audits'
                      onClick={() => setShowNotifications(false)}
                      className='text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors'
                    >
                      {tNotifications('viewAll')}
                    </NavLink>
                  </div>
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
              aria-haspopup='menu'
              aria-expanded={showProfileDropdown}
              aria-label={t('ui.profile')}
            >
              <div className='hidden sm:block text-right min-w-0'>
                <p className='text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors'>
                  {user?.user_metadata?.full_name || profile?.full_name || t('roles.user')}
                </p>
                <div className='flex items-center justify-end'>
                  {profile?.role && (
                    <Badge
                      variant={profile.role as 'admin' | 'moderator' | 'user'}
                      size='sm'
                      showIcon
                    >
                      {t(`roles.${profile.role}`)}
                    </Badge>
                  )}
                </div>
              </div>

              <Avatar
                src={null}
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
                      src={null}
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
                            variant={profile.role as 'admin' | 'moderator' | 'user'}
                            size='md'
                            showIcon
                          >
                            {t(`roles.${profile.role}`)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grouped Language & Theme Selection */}
                <div className='px-4 py-3 border-b border-gray-100 dark:border-gray-700'>
                  <div className='flex flex-col gap-3'>
                    {/* Language Selector */}
                    <div>
                      <span className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1'>
                        {t('ui.language')}
                      </span>
                      <PopoverMenu
                        options={LANGUAGES.map(lang => ({
                          value: lang.code,
                          label: lang.nativeName,
                          sublabel: lang.name,
                          icon: <span className='mr-2'>{lang.flag}</span>,
                        }))}
                        value={i18n.language as string}
                        onChange={code => { if (code !== i18n.language) i18n.changeLanguage(code) }}
                        className='w-full bg-white dark:bg-gray-800 focus:outline-none shadow-none border-0'
                        placeholder='Select language'
                        ariaLabel='Language selector'
                        placement='left'
                        renderTrigger={(selected) => (
                          <button
                            type='button'
                            className='w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-colors border-0 shadow-none hover:bg-gray-50 dark:hover:bg-gray-700'
                            aria-label='Language selector'
                          >
                            <div className='flex items-center'>
                              {selected && selected.icon}
                              <span>{selected ? selected.label : 'Select language'}</span>
                              {selected && selected.sublabel && (
                                <span className='ml-2 text-xs text-gray-500'>{selected.sublabel}</span>
                              )}
                            </div>
                            <ChevronRight className='w-4 h-4 ml-2 text-gray-400' />
                          </button>
                        )}
                      />
                    </div>
                    {/* Theme Selector */}
                    <ThemeSelectorDropdown />
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
                    {t('ui.accountSettings')}
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

const ThemeSelectorDropdown: React.FC = () => {
  const { theme, setTheme } = useThemeStore()
  const { t } = useTranslation()
  const themeOptions = [
    {
      value: 'light',
      label: t('ui.theme.light'),
      icon: <Sun className='w-4 h-4 mr-2' />,
    },
    {
      value: 'dark',
      label: t('ui.theme.dark'),
      icon: <Moon className='w-4 h-4 mr-2' />,
    },
  ]
  return (
    <div>
      <span className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1'>
        {t('ui.theme.title')}
      </span>
      <PopoverMenu
        options={themeOptions}
        value={theme}
        onChange={(val) => setTheme(val as 'light' | 'dark')}
        className='w-full bg-white dark:bg-gray-800 focus:outline-none shadow-none border-0'
        placeholder={t('ui.theme.title')}
        ariaLabel={t('ui.theme.title')}
        placement='left'
        renderTrigger={(selected) => (
          <button
            type='button'
            className='w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none transition-colors border-0 shadow-none hover:bg-gray-50 dark:hover:bg-gray-700'
            aria-label={t('ui.theme.title')}
          >
            <div className='flex items-center'>
              {selected && selected.icon}
              <span>{selected ? selected.label : t('ui.theme.title')}</span>
            </div>
            <ChevronRight className='w-4 h-4 ml-2 text-gray-400' />
          </button>
        )}
      />
    </div>
  )
}
