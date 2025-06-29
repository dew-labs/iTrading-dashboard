import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Save, X, CheckCircle } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useChangePassword } from '../hooks/useChangePassword'
import { validators } from '../utils/format'
import { getButtonClasses, getTypographyClasses, cn } from '../utils/theme'
import LoadingSpinner from './LoadingSpinner'

interface ChangePasswordFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormData {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

interface FormErrors {
  currentPassword?: string
  newPassword?: string
  confirmNewPassword?: string
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess, onCancel }) => {
  const { t } = useTranslation()
  const { changePassword, loading } = useChangePassword()

  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Current password validation
    if (!validators.required(formData.currentPassword)) {
      newErrors.currentPassword = t('forms.validation.currentPasswordRequired')
    }

    // New password validation
    if (!validators.required(formData.newPassword)) {
      newErrors.newPassword = t('forms.validation.newPasswordRequired')
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('forms.validation.newPassword')
    }

    // Confirm new password validation
    if (!validators.required(formData.confirmNewPassword)) {
      newErrors.confirmNewPassword = t('forms.validation.required')
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = t('forms.validation.confirmNewPassword')
    }

    // Check if new password is different from current
    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Note: Supabase doesn't have a direct way to verify current password
      // In a production app, you might want to implement this server-side

      const { success } = await changePassword(formData.newPassword)

      if (!success) {
        return
      }

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      })
      setErrors({})

      onSuccess?.()
    } catch (error) {
      console.error('Password change error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newErrors: FormErrors = { ...errors }

    switch (name) {
    case 'currentPassword':
      if (!validators.required(value)) {
        newErrors.currentPassword = t('forms.validation.currentPasswordRequired')
      } else {
        delete newErrors.currentPassword
      }
      break

    case 'newPassword':
      if (!validators.required(value)) {
        newErrors.newPassword = t('forms.validation.newPasswordRequired')
      } else if (value.length < 8) {
        newErrors.newPassword = t('forms.validation.newPassword')
      } else if (formData.currentPassword && value === formData.currentPassword) {
        newErrors.newPassword = 'New password must be different from current password'
      } else {
        delete newErrors.newPassword
      }
      break

    case 'confirmNewPassword':
      if (!validators.required(value)) {
        newErrors.confirmNewPassword = t('forms.validation.required')
      } else if (formData.newPassword !== value) {
        newErrors.confirmNewPassword = t('forms.validation.confirmNewPassword')
      } else {
        delete newErrors.confirmNewPassword
      }
      break
    }

    setErrors(newErrors)
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' }

    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    const strength = [
      { label: 'Weak', color: 'bg-red-500' },
      { label: 'Fair', color: 'bg-orange-500' },
      { label: 'Good', color: 'bg-yellow-500' },
      { label: 'Strong', color: 'bg-green-500' }
    ]

    const strengthData = strength[Math.min(score - 1, 3)] || { label: '', color: '' }
    return { score, ...strengthData }
  }

  const getInputClasses = (hasError: boolean = false) => {
    return cn(
      'w-full py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg',
      'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
      'placeholder-gray-500 dark:placeholder-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-300 focus:border-transparent',
      'transition-all duration-200',
      'disabled:bg-gray-50 dark:disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed',
      hasError && 'border-red-500 focus:ring-red-500 focus:border-red-500'
    )
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className={getTypographyClasses('h2')}>{t('forms.changePassword.title')}</h2>
        <p className={cn(getTypographyClasses('description'), 'mt-2')}>
          {t('forms.changePassword.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('forms.labels.currentPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                getInputClasses(!!errors.currentPassword),
                'pl-10 pr-12'
              )}
              placeholder={t('forms.placeholders.enterCurrentPassword')}
              required
              disabled={isSubmitting || loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isSubmitting || loading}
            >
              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('forms.changePassword.currentPasswordHelp')}
          </p>
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('forms.labels.newPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                getInputClasses(!!errors.newPassword),
                'pl-10 pr-12'
              )}
              placeholder={t('forms.placeholders.enterNewPassword')}
              required
              disabled={isSubmitting || loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isSubmitting || loading}
            >
              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
          )}

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={cn('h-2 rounded-full transition-all duration-300', passwordStrength.color)}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 min-w-0">
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t('forms.changePassword.newPasswordHelp')}
          </p>
        </div>

        {/* Confirm New Password */}
        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t('forms.labels.confirmNewPassword')}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={cn(
                getInputClasses(!!errors.confirmNewPassword),
                'pl-10 pr-12'
              )}
              placeholder={t('forms.placeholders.confirmNewPassword')}
              required
              disabled={isSubmitting || loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isSubmitting || loading}
            >
              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmNewPassword}</p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('forms.changePassword.passwordRequirements')}
          </h4>
          <ul className="space-y-2">
            {[
              { key: 'requirement1', test: formData.newPassword.length >= 8 },
              { key: 'requirement2', test: /[a-z]/.test(formData.newPassword) && /[A-Z]/.test(formData.newPassword) },
              { key: 'requirement3', test: /\d/.test(formData.newPassword) },
              { key: 'requirement4', test: /[^a-zA-Z0-9]/.test(formData.newPassword) }
            ].map(({ key, test }) => (
              <li key={key} className="flex items-center space-x-2">
                <CheckCircle
                  className={cn(
                    'w-4 h-4',
                    test ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                  )}
                />
                <span className={cn(
                  'text-sm',
                  test ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                )}>
                  {t(`forms.changePassword.${key}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || loading || Object.keys(errors).length > 0}
            className={cn(
              getButtonClasses('primary', 'md'),
              'flex-1 sm:flex-none sm:min-w-[140px]'
            )}
          >
            {isSubmitting || loading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" className="text-white" />
                <span>Changing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="w-4 h-4" />
                <span>{t('forms.changePassword.submitButton')}</span>
              </div>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || loading}
              className={cn(
                getButtonClasses('secondary', 'md'),
                'flex-1 sm:flex-none sm:min-w-[100px]'
              )}
            >
              <div className="flex items-center justify-center space-x-2">
                <X className="w-4 h-4" />
                <span>{t('forms.changePassword.cancelButton')}</span>
              </div>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ChangePasswordForm
