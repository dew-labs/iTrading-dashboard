import React from 'react'
import { Lock, Save, X, CheckCircle } from 'lucide-react'
import { useTranslation } from '../../../hooks/useTranslation'
import { useChangePassword } from '../../../hooks/useChangePassword'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { validators } from '../../../utils/validation'
import { getButtonClasses, getTypographyClasses, cn } from '../../../utils/theme'
import { FormField } from '../../atoms'
import { LoadingSpinner } from '../../feedback'

interface ChangePasswordFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormData {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess, onCancel }) => {
  const { t } = useTranslation()
  const { changePassword, loading } = useChangePassword()
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
  } = useFormValidation<FormData>({
    schema: {
      currentPassword: {
        required: true,
        message: 'Current password is required'
      },
      newPassword: {
        required: true,
        minLength: 8,
        custom: (value: string): boolean | string => {
          const result = validators.password(value)
          if (!result.isValid) {
            return `Password requirements: ${result.requirements
              .filter(req => !req.met)
              .map(req => req.text)
              .join(', ')}`
          }
          return true
        }
      },
      confirmNewPassword: {
        required: true,
        custom: (value: string): boolean | string => {
          return value === formData.newPassword || 'Passwords must match'
        },
        message: 'Please confirm your new password'
      }
    },
    initialData: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    },
    validateOnBlur: true,
    validateOnChange: false
  })

  const handleFormSubmit = async (data: FormData) => {
    // Additional validation: check if new password is different from current
    if (data.currentPassword === data.newPassword) {
      updateField('newPassword', data.newPassword) // Trigger validation
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
  }



  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' }

    const result = validators.password(password)
    const score = result.score

    const strength = [
      { label: 'Weak', color: 'bg-red-500' },
      { label: 'Fair', color: 'bg-orange-500' },
      { label: 'Good', color: 'bg-yellow-500' },
      { label: 'Strong', color: 'bg-green-500' }
    ]

    const strengthData = strength[Math.min(score - 1, 3)] || { label: '', color: '' }
    return { score, ...strengthData }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)
  const passwordRequirements = validators.password(formData.newPassword).requirements

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
        />

        {/* Password Requirements */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {t('forms.changePassword.passwordRequirements')}
          </h4>
          <ul className="space-y-2">
            {passwordRequirements.map((requirement, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle
                  className={cn(
                    'w-4 h-4',
                    requirement.met ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                  )}
                />
                <span className={cn(
                  'text-sm',
                  requirement.met ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                )}>
                  {requirement.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isValidating || loading || Object.keys(errors).length > 0}
            className={cn(
              getButtonClasses('primary', 'md'),
              'flex-1 sm:flex-none sm:min-w-[140px]'
            )}
          >
            {isValidating || loading ? (
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
              disabled={isValidating || loading}
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
