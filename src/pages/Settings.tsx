import React from 'react'
import { Settings, User, Bell, Shield, Database, Globe, Palette, Moon } from 'lucide-react'
import {
  getPageLayoutClasses,
  getButtonClasses,
  getTypographyClasses,
  getCardClasses,
  cn
} from '../utils/theme'

const SettingsPage: React.FC = () => {
  const layout = getPageLayoutClasses()

  const settingsCategories = [
    {
      title: 'Account Settings',
      icon: User,
      description: 'Manage your account preferences and personal information',
      items: [
        'Profile Information',
        'Password & Security',
        'Email Preferences',
        'Privacy Settings'
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      description: 'Configure how and when you receive notifications',
      items: [
        'Email Notifications',
        'Push Notifications',
        'Activity Alerts',
        'Marketing Updates'
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      description: 'Manage security settings and access controls',
      items: [
        'Two-Factor Authentication',
        'Login Sessions',
        'API Keys',
        'Security Logs'
      ]
    },
    {
      title: 'System',
      icon: Database,
      description: 'Configure system-wide settings and preferences',
      items: [
        'Database Settings',
        'Backup Configuration',
        'Performance Monitoring',
        'Error Logging'
      ]
    },
    {
      title: 'Localization',
      icon: Globe,
      description: 'Set language, timezone, and regional preferences',
      items: [
        'Language & Region',
        'Date & Time Format',
        'Currency Settings',
        'Number Formatting'
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      description: 'Customize the look and feel of your dashboard',
      items: [
        'Theme Selection',
        'Color Scheme',
        'Layout Preferences',
        'Sidebar Configuration'
      ]
    }
  ]

  return (
    <div className={layout.container}>
      <div className="space-y-6">
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>Settings</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              Manage your account settings and system preferences
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button className={getButtonClasses('secondary', 'md')}>
              <Database className="w-4 h-4 mr-2" />
              Export Settings
            </button>
            <button className={getButtonClasses('primary', 'md')}>
              <Shield className="w-4 h-4 mr-2" />
              Security Check
            </button>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCategories.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.title} className={getCardClasses('base')}>
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>
                        {category.title}
                      </h3>
                      <p className={cn(getTypographyClasses('description'), 'mb-4')}>
                        {category.description}
                      </p>
                      <ul className="space-y-2">
                        {category.items.map((item) => (
                          <li key={item} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                            <span className={cn(getTypographyClasses('small'), 'text-gray-600')}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button className={getButtonClasses('secondary', 'sm')}>
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Settings */}
        <div className={getCardClasses('base')}>
          <div className="p-6">
            <h3 className={cn(getTypographyClasses('h3'), 'mb-6')}>Quick Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-gray-600" />
                  <span className={getTypographyClasses('small')}>Dark Mode</span>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className={getTypographyClasses('small')}>Notifications</span>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className={getTypographyClasses('small')}>Auto-save</span>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className={getCardClasses('base')}>
          <div className="p-8 text-center">
            <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>
              More Settings Coming Soon
            </h3>
            <p className={getTypographyClasses('description')}>
              We're continuously adding new customization options to enhance your experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
