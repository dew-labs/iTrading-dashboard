import React from 'react'
import { Settings, User, Bell, Shield, Database, Globe, Palette, Moon } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import {
  getPageLayoutClasses,
  getButtonClasses,
  getTypographyClasses,
  getCardClasses,
  cn
} from '../utils/theme'

const SettingsPage: React.FC = () => {
  const { t } = useTranslation()
  const layout = getPageLayoutClasses()

  const settingsCategories = [
    {
      titleKey: 'accountSettings',
      icon: User,
      descriptionKey: 'accountSettingsDesc',
      itemKeys: [
        'profileInformation',
        'passwordSecurity',
        'emailPreferences',
        'privacySettings'
      ]
    },
    {
      titleKey: 'notifications',
      icon: Bell,
      descriptionKey: 'notificationsDesc',
      itemKeys: [
        'emailNotifications',
        'pushNotifications',
        'activityAlerts',
        'marketingUpdates'
      ]
    },
    {
      titleKey: 'security',
      icon: Shield,
      descriptionKey: 'securityDesc',
      itemKeys: [
        'twoFactorAuth',
        'loginSessions',
        'apiKeys',
        'securityLogs'
      ]
    },
    {
      titleKey: 'system',
      icon: Database,
      descriptionKey: 'systemDesc',
      itemKeys: [
        'databaseSettings',
        'backupConfiguration',
        'performanceMonitoring',
        'errorLogging'
      ]
    },
    {
      titleKey: 'localization',
      icon: Globe,
      descriptionKey: 'localizationDesc',
      itemKeys: [
        'languageRegion',
        'dateTimeFormat',
        'currencySettings',
        'numberFormatting'
      ]
    },
    {
      titleKey: 'appearance',
      icon: Palette,
      descriptionKey: 'appearanceDesc',
      itemKeys: [
        'themeSelection',
        'colorScheme',
        'layoutPreferences',
        'sidebarConfiguration'
      ]
    }
  ]

  return (
    <div className={layout.container}>
      <div className="space-y-6">
        {/* Header */}
        <div className={layout.header}>
          <div>
            <h1 className={getTypographyClasses('h1')}>{t('settings')}</h1>
            <p className={cn(getTypographyClasses('description'), 'mt-2')}>
              {t('manageAccountSettings')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button className={getButtonClasses('secondary', 'md')}>
              <Database className="w-4 h-4 mr-2" />
              {t('exportSettings')}
            </button>
            <button className={getButtonClasses('primary', 'md')}>
              <Shield className="w-4 h-4 mr-2" />
              {t('securityCheck')}
            </button>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCategories.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.titleKey} className={getCardClasses('base')}>
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={cn(getTypographyClasses('h3'), 'mb-2')}>
                        {t(category.titleKey)}
                      </h3>
                      <p className={cn(getTypographyClasses('description'), 'mb-4')}>
                        {t(category.descriptionKey)}
                      </p>
                      <ul className="space-y-2">
                        {category.itemKeys.map((itemKey) => (
                          <li key={itemKey} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mr-3"></div>
                            <span className={cn(getTypographyClasses('small'), 'text-gray-600')}>
                              {t(itemKey)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <button className={getButtonClasses('secondary', 'sm')}>
                      {t('configure')}
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
            <h3 className={cn(getTypographyClasses('h3'), 'mb-6')}>{t('quickSettings')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Moon className="w-5 h-5 text-gray-600" />
                  <span className={getTypographyClasses('small')}>{t('darkMode')}</span>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className={getTypographyClasses('small')}>{t('notifications')}</span>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className={getTypographyClasses('small')}>{t('autoSave')}</span>
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
              {t('moreSettingsComingSoon')}
            </h3>
            <p className={getTypographyClasses('description')}>
              {t('continuouslyAddingOptions')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
