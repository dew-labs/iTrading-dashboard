import React, { useMemo, useCallback } from 'react'
import { Lock, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { useChangePassword } from '../../../hooks/useChangePassword'
import { useTranslation } from '../../../hooks/useTranslation'
import { FormField } from '../../atoms'
import { cn, getTypographyClasses } from '../../../utils/theme'



// Move schema outside component to prevent re-renders
const CHANGE_PASSWORD_SCHEMA = {
  currentPassword: {
    required: true,
    message: 'Current password is required'
  },
  newPassword: {
    required: true,
    minLength: 8,
    custom: (value: string): boolean | string => {
      const errors = []
      if (value.length < 8) errors.push('at least 8 characters')
      if (!/[a-z]/.test(value)) errors.push('one lowercase letter')
      if (!/[A-Z]/.test(value)) errors.push('one uppercase letter')
      if (!/\d/.test(value)) errors.push('one number')
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) errors.push('one special character')

      if (errors.length > 0) {
        return `Password must contain: ${errors.join(', ')}`
      }
      return true
    }
  },
  confirmNewPassword: {
    required: true,
    message: 'Please confirm your new password'
  }
} as const

interface ChangePasswordFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess, onCancel }) => {
  const { t } = useTranslation()
  const { changePassword, loading } = useChangePassword()

  // Memoize initial data to prevent re-renders
  const initialData = useMemo(() => ({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  }), [])

  // Enhanced form validation with our new hook
  const {
    data: formData,
    errors,
    isValidating,
    updateField,
    handleBlur,
    handleChange,
    handleSubmit,
    reset
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useFormValidation<any>({
    schema: CHANGE_PASSWORD_SCHEMA,
    initialData,
    validateOnBlur: true,
    validateOnChange: false
  })

  // Custom validation for password confirmation
  const validatePasswordConfirmation = useCallback(() => {
    if (formData.confirmNewPassword && formData.newPassword !== formData.confirmNewPassword) {
      updateField('confirmNewPassword', formData.confirmNewPassword)
      // The validation will trigger through the dependency check
    }
  }, [formData.newPassword, formData.confirmNewPassword, updateField])

  React.useEffect(() => {
    validatePasswordConfirmation()
  }, [validatePasswordConfirmation])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = useCallback(async (data: any) => {
    // Check if new password is same as current
    if (data.currentPassword === data.newPassword) {
      updateField('newPassword', data.newPassword) // Trigger validation
      return
    }

    // Check password confirmation
    if (data.newPassword !== data.confirmNewPassword) {
      updateField('confirmNewPassword', data.confirmNewPassword)
      return
    }

    try {
      const { success } = await changePassword(data.newPassword)

      if (!success) {
        return
      }

      // Reset form
      reset()
      onSuccess?.()
    } catch (error) {
      console.error('Password change error:', error)
    }
  }, [changePassword, updateField, reset, onSuccess])

  const getPasswordStrength = useCallback((password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' }

    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

    const strength = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-red-400' },
      { label: 'Fair', color: 'bg-orange-500' },
      { label: 'Good', color: 'bg-yellow-500' },
      { label: 'Strong', color: 'bg-green-500' }
    ]

    const strengthData = strength[score] || { label: 'Very Weak', color: 'bg-red-500' }
    return { score, ...strengthData }
  }, [])

  const passwordStrength = useMemo(() => getPasswordStrength(formData.newPassword), [formData.newPassword, getPasswordStrength])

  const passwordRequirements = useMemo(() => [
    { text: 'At least 8 characters', met: formData.newPassword.length >= 8 },
    { text: 'One lowercase letter', met: /[a-z]/.test(formData.newPassword) },
    { text: 'One uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
    { text: 'One number', met: /\d/.test(formData.newPassword) },
    { text: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword) }
  ], [formData.newPassword])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className={getTypographyClasses('h2')}>{t('forms.changePassword.title')}</h2>
        <p className={cn(getTypographyClasses('description'), 'mt-2')}>
          {t('forms.changePassword.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Current Password */}
        <FormField
          label={t('forms.labels.currentPassword')}
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange('currentPassword')}
          onBlur={handleBlur('currentPassword')}
          placeholder={t('forms.placeholders.enterCurrentPassword')}
          required
          disabled={isValidating || loading}
          {...(errors.currentPassword && { error: errors.currentPassword })}
          icon={<Lock className="w-5 h-5" />}
          isPasswordField
          showPasswordToggle
          helperText={t('forms.changePassword.currentPasswordHelp')}
        />

        {/* New Password */}
        <div className="space-y-3">
          <FormField
            label={t('forms.labels.newPassword')}
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange('newPassword')}
            onBlur={handleBlur('newPassword')}
            placeholder={t('forms.placeholders.enterNewPassword')}
            required
            disabled={isValidating || loading}
            {...(errors.newPassword && { error: errors.newPassword })}
            icon={<Lock className="w-5 h-5" />}
            isPasswordField
            showPasswordToggle
          />

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Password Strength:</span>
                <span className={`text-sm font-medium ${
                  passwordStrength.score >= 3 ? 'text-green-600' :
                  passwordStrength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Password Requirements */}
          {formData.newPassword && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Password Requirements:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {req.met ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <FormField
          label={t('forms.labels.confirmNewPassword')}
          type="password"
          name="confirmNewPassword"
          value={formData.confirmNewPassword}
          onChange={handleChange('confirmNewPassword')}
          onBlur={handleBlur('confirmNewPassword')}
          placeholder={t('forms.placeholders.confirmNewPassword')}
          required
          disabled={isValidating || loading}
          {...(errors.confirmNewPassword && { error: errors.confirmNewPassword })}
          icon={<Lock className="w-5 h-5" />}
          isPasswordField
          showPasswordToggle
          helperText={t('forms.changePassword.confirmPasswordHelp')}
        />

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isValidating || loading}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              {t('forms.actions.cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={isValidating || loading || !formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword}
            className="px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isValidating || loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-gray-900 mr-2"></div>
                {t('forms.changePassword.changing')}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {t('forms.changePassword.changePassword')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChangePasswordForm
