import React, { useMemo, useCallback } from 'react'
import { User, Shield, X, Save, Mail, Camera, Gavel } from 'lucide-react'
import type { DatabaseUser, UserInsert, UserRole } from '../../../types'
import { usePermissions } from '../../../hooks/usePermissions'
import { useTranslation, useFormTranslation } from '../../../hooks/useTranslation'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { formSchemas } from '../../../utils/validation'
import { USER_ROLES, COUNTRY_OPTIONS } from '../../../constants/general'
import { FormField } from '../../atoms'
import { Select } from '../../molecules'
import { MainImageUpload } from '../images'

// Move schema outside component to prevent re-renders
const USER_FORM_SCHEMA = {
  ...formSchemas.user,
  // Add custom validation for role
  role: {
    required: true,
    custom: (value: UserRole) => Object.values(USER_ROLES).includes(value),
    message: 'Please select a valid role'
  }
} as const

interface UserFormProps {
  user?: DatabaseUser | null
  onSubmit: (data: Omit<UserInsert, 'id'>) => void
  onCancel: () => void
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const { t } = useTranslation()
  const { t: tForm } = useFormTranslation()
  const { isAdmin } = usePermissions()

  // Memoize initial data to prevent re-renders
  const initialData = useMemo(() => ({
    email: '',
    full_name: '',
    phone: '',
    country: '',
    role: 'user' as UserRole,
    status: 'invited' as const,
    avatar_url: null as string | null
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
  } = useFormValidation({
    schema: USER_FORM_SCHEMA,
    initialData,
    validateOnBlur: true,
    validateOnChange: false
  })

  React.useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        full_name: user.full_name || '',
        phone: user.phone || '',
        country: user.country || '',
        role: user.role,
        status: 'invited',
        avatar_url: user.avatar_url ?? null
      })
    }
  }, [user, reset])

  const handleAvatarUpload = useCallback((url: string | null) => {
    updateField('avatar_url', url)
  }, [updateField])

  const roleOptions = useMemo(() => [
    {
      value: USER_ROLES.USER,
      label: t('roles.user'),
      icon: <User className='w-4 h-4' />
    },
    {
      value: USER_ROLES.MODERATOR,
      label: t('roles.moderator'),
      icon: <Gavel className='w-4 h-4' />
    },
    ...(isAdmin()
      ? [
        {
          value: USER_ROLES.ADMIN,
          label: t('roles.admin'),
          icon: <Shield className='w-4 h-4' />
        }
      ]
      : [])
  ], [t, isAdmin])

  const handleFormSubmit = useCallback((data: typeof formData) => {
    onSubmit(data)
  }, [onSubmit])

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      {/* Avatar Upload Section */}
      <div className='bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700'>
        <div className='flex items-center space-x-4 mb-4'>
          <div className='flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
            <Camera className='w-5 h-5 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              {t('forms:userForm.profilePicture')}
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {t('forms:userForm.profilePictureDescription')}
            </p>
          </div>
        </div>

        <div className='flex items-start space-x-6'>
          <MainImageUpload
            imageUrl={formData.avatar_url ?? null}
            onChange={handleAvatarUpload}
            bucket='users'
            folder='avatars'
            alt={`${formData.full_name || formData.email} avatar`}
            label=''
            size='md'
            disabled={isValidating}
            className='flex-shrink-0'
          />
          <div className='flex-1 space-y-2'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {t('forms:userForm.avatarGuidelines')}
            </p>
            <ul className='text-xs text-gray-500 dark:text-gray-500 space-y-1'>
              <li>• {t('forms:userForm.avatarSquareRecommended')}</li>
              <li>• {t('forms:userForm.avatarMaxSize')}</li>
              <li>• {t('forms:userForm.avatarFormats')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Basic information in grid using enhanced FormField */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField
          label={t('forms:labels.emailAddress')}
          type='email'
          name='email'
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          placeholder={tForm('placeholders.userEmail')}
          required
          disabled={!!user || isValidating}
          {...(errors.email && { error: errors.email })}
          {...(!user && { helperText: t('userForm.emailInviteHelpText') })}
          icon={<Mail className='w-5 h-5' />}
        />

        <FormField
          label={t('forms:labels.fullName')}
          name='full_name'
          value={formData.full_name || ''}
          onChange={handleChange('full_name')}
          onBlur={handleBlur('full_name')}
          placeholder={t('forms:placeholders.fullNamePlaceholder')}
          required
          disabled={isValidating}
          {...(errors.full_name && { error: errors.full_name })}
          icon={<User className='w-5 h-5' />}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField
          label={t('forms:labels.phoneNumber')}
          type='tel'
          name='phone'
          value={formData.phone || ''}
          onChange={handleChange('phone')}
          onBlur={handleBlur('phone')}
          placeholder={tForm('placeholders.userPhone')}
          disabled={isValidating}
          {...(errors.phone && { error: errors.phone })}
          helperText={t('userForm.phoneHelpText')}
        />

        <Select
          label={t('userForm.userRolePermissions')}
          required
          value={formData.role || 'user'}
          onChange={value => updateField('role', value as UserRole)}
          options={roleOptions}
          disabled={isValidating}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Select
          label={t('forms:labels.country')}
          value={formData.country || ''}
          onChange={value => updateField('country', value)}
          options={COUNTRY_OPTIONS}
          disabled={isValidating}
          required={false}
          error={errors.country ?? ''}
          placeholder={tForm('placeholders.country')}
        />
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          disabled={isValidating}
          className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
        >
          <X className='w-4 h-4 mr-2' />
          {t('actions.cancel')}
        </button>
        <button
          type='submit'
          disabled={isValidating}
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
        >
          {isValidating ? (
            <>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
              {user ? t('userForm.updating') : t('userForm.sendingInvite')}
            </>
          ) : (
            <>
              {user ? <Save className='w-4 h-4 mr-2' /> : <Mail className='w-4 h-4 mr-2' />}
              {user ? t('userForm.updateUser') : t('userForm.sendInvitation')}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default UserForm
