import React, { useState } from 'react'
import { usePageTranslation, useTranslation, useFormTranslation } from '../hooks/useTranslation'
import { getTypographyClasses } from '../utils/theme'
import { Input, Button, Select } from '../components'
import { useThemeStore } from '../store/themeStore'
import { useChangePassword } from '../hooks/useChangePassword'

import {
  Settings as SettingsIcon,
  Palette,
  Shield,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react'

const Settings: React.FC = () => {
  const { t } = usePageTranslation() // Settings translations from pages namespace
  const { t: tCommon } = useTranslation() // Common translations
  const { t: tForms } = useFormTranslation() // Form translations
  const { changeLanguage, language } = useTranslation()
  const { theme, setTheme } = useThemeStore()
  const { changePassword, loading: passwordLoading } = useChangePassword()
  const [selectedSection, setSelectedSection] = useState('account')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Navigation sections
  const sections = [
    {
      id: 'account',
      title: t('settings.account'),
      description: t('settings.accountDescription'),
      icon: SettingsIcon
    },
    {
      id: 'appearance',
      title: t('settings.appearance'),
      description: t('settings.appearanceDescription'),
      icon: Palette
    },
    {
      id: 'password',
      title: t('settings.password'),
      description: t('settings.passwordDescription'),
      icon: Shield
    }
  ]

  const languageOptions = [
    { value: 'en', label: '🇺🇸 English' },
    { value: 'pt', label: '🇧🇷 Português' }
  ]

  const themeOptions = [
    { value: 'light', label: tCommon('ui.theme.light'), icon: Sun },
    { value: 'dark', label: tCommon('ui.theme.dark'), icon: Moon }
  ]

  const handleLanguageChange = (value: string) => {
    changeLanguage(value)
  }

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark')
  }

  const handlePasswordSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return
    }

    if (newPassword !== confirmPassword) {
      return
    }

    const result = await changePassword(newPassword)
    if (result.success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  // Password validation function
  const validatePassword = (password: string) => {
    return {
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  }

  const passwordValidation = validatePassword(newPassword)

  const renderSectionContent = () => {
    switch (selectedSection) {
    case 'account':
      return (
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
          <div className='mb-6'>
            <h3 className={getTypographyClasses('h3')}>{t('settings.account')}</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{t('settings.accountDescription')}</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
              {t('settings.language')}
            </label>
            <Select
              value={language}
              onChange={handleLanguageChange}
              options={languageOptions}
              placeholder={t('settings.selectLanguage')}
              size='md'
            />
          </div>
        </div>
      )

    case 'appearance':
      return (
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
          <div className='mb-6'>
            <h3 className={getTypographyClasses('h3')}>{t('settings.appearance')}</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{t('settings.appearanceDescription')}</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
              {t('settings.theme')}
            </label>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {themeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value)}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      theme === option.value
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-700'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon className='w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400' />
                    <span className='text-sm font-medium text-gray-900 dark:text-white'>
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )

    case 'password':
      return (
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
          <div className='mb-6'>
            <h3 className={getTypographyClasses('h3')}>{t('settings.password')}</h3>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{t('settings.passwordDescription')}</p>
          </div>

          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='relative'>
                <Input
                  label={tForms('labels.currentPassword')}
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={tForms('placeholders.enterCurrentPassword')}
                />
                <button
                  type='button'
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className='absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10'
                >
                  {showCurrentPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>

              <div className='relative'>
                <Input
                  label={tForms('labels.newPassword')}
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={tForms('placeholders.enterNewPassword')}
                />
                <button
                  type='button'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className='absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10'
                >
                  {showNewPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>

              <div className='relative'>
                <Input
                  label={tForms('labels.confirmNewPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={tForms('placeholders.confirmNewPassword')}
                  {...(confirmPassword && newPassword !== confirmPassword && { error: 'Passwords do not match' })}
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10'
                >
                  {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
              <h5 className='text-sm font-medium text-gray-900 dark:text-white mb-2'>
                {tForms('passwordRequirements')}
              </h5>
              <ul className='text-xs space-y-2'>
                <li className={`flex items-center space-x-2 ${passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {passwordValidation.minLength ? <Check className='w-3 h-3' /> : <X className='w-3 h-3' />}
                  <span>{tForms('passwordMinLength')}</span>
                </li>
                <li className={`flex items-center space-x-2 ${passwordValidation.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {passwordValidation.uppercase ? <Check className='w-3 h-3' /> : <X className='w-3 h-3' />}
                  <span>{tForms('passwordUppercase')}</span>
                </li>
                <li className={`flex items-center space-x-2 ${passwordValidation.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {passwordValidation.lowercase ? <Check className='w-3 h-3' /> : <X className='w-3 h-3' />}
                  <span>{tForms('passwordLowercase')}</span>
                </li>
                <li className={`flex items-center space-x-2 ${passwordValidation.number ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {passwordValidation.number ? <Check className='w-3 h-3' /> : <X className='w-3 h-3' />}
                  <span>{tForms('passwordNumber')}</span>
                </li>
                <li className={`flex items-center space-x-2 ${passwordValidation.specialChar ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {passwordValidation.specialChar ? <Check className='w-3 h-3' /> : <X className='w-3 h-3' />}
                  <span>{tForms('passwordSpecialChar')}</span>
                </li>
              </ul>
            </div>

            <Button
              variant='primary'
              leftIcon={Shield}
              disabled={
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                !Object.values(passwordValidation).every(Boolean)
              }
              loading={passwordLoading}
              onClick={handlePasswordSubmit}
            >
              {tForms('changePassword')}
            </Button>
          </div>
        </div>
      )

    default:
      return null
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className={getTypographyClasses('h1')}>{t('settings.title')}</h1>
          <p className={getTypographyClasses('description')}>{t('settings.description')}</p>
        </div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Left Sidebar */}
          <div className='lg:w-80'>
            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700'>
              <div className='p-6'>
                <h2 className={`${getTypographyClasses('h3')} mb-4`}>{t('settings.sections')}</h2>
                <nav className='space-y-2'>
                  {sections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(section.id)}
                        className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 text-left ${
                          selectedSection === section.id
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm shadow-teal-500/25'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 hover:text-teal-900 dark:hover:text-teal-200 hover:shadow-sm'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${
                          selectedSection === section.id
                            ? 'text-white'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-teal-700 dark:group-hover:text-teal-300'
                        }`} />
                        <div className='flex-1 min-w-0'>
                          <div className={`text-sm font-medium leading-tight ${
                            selectedSection === section.id
                              ? 'text-white'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {section.title}
                          </div>
                        </div>
                        {/* Active indicator */}
                        {selectedSection === section.id && (
                          <div className='w-2 h-2 bg-white rounded-full flex-shrink-0 ml-3'></div>
                        )}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            {renderSectionContent()}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Settings
