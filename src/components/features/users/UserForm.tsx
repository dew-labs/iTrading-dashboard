import React, { useMemo, useCallback, useState } from 'react'
import { User, Shield, X, Save, Mail, Camera, Gavel } from 'lucide-react'
import type { DatabaseUser, UserInsert, UserRole, Image } from '../../../types'
// import { usePermissions } from '../../../hooks/usePermissions'
import { useTranslation, useFormTranslation } from '../../../hooks/useTranslation'
import { useFormValidation } from '../../../hooks/useFormValidation'
import { formSchemas } from '../../../utils/validation'
import { USER_ROLES, COUNTRY_OPTIONS } from '../../../constants/general'
import { FormField, Button } from '../../atoms'
import { Select, FormContainer, FormErrorBanner } from '../../molecules'
import { MainImageUpload } from '../images'
import type { UploadResult } from '../../../hooks/useFileUpload'
import { supabase } from '../../../lib/supabase'

const USER_FORM_SCHEMA = formSchemas.user

// New: Invite schema for email and role
const INVITE_USER_SCHEMA = {
  email: formSchemas.user.email,
  role: formSchemas.user.role
} as const

interface UserFormProps {
  user?: DatabaseUser | null
  onSubmit: (
    data: Omit<UserInsert, 'id'>,
    avatarImage?: (Partial<Image> & { publicUrl?: string; file?: File }) | null
  ) => void
  onCancel: () => void
  images?: Image[] | null
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, images }) => {
  const { t, t: tCommon } = useTranslation()
  const { t: tForm } = useFormTranslation()
  // const { isAdmin } = usePermissions() // No longer needed

  // Determine mode
  const isInviteMode = !user

  const [avatarImage, setAvatarImage] = useState<
    (Partial<Image> & { publicUrl?: string; file?: File }) | null
  >(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Memoize initial data to prevent re-renders
  const initialData = useMemo(() =>
    isInviteMode
      ? { email: '', role: USER_ROLES.USER as UserRole }
      : {
          email: '',
          full_name: '',
          phone: '',
          country: '',
          city: '',
          bio: '',
          role: 'user' as UserRole,
          status: 'invited' as const
        },
    [isInviteMode]
  )

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
    schema: isInviteMode ? INVITE_USER_SCHEMA : USER_FORM_SCHEMA,
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
        city: user.city || '',
        bio: user.bio || '',
        role: user.role,
        status: 'invited'
      })
      const existingAvatar = images?.find(
        img => img.record_id === user.id && img.type === 'avatar'
      )
      if (existingAvatar) {
        const { data: urlData } = supabase.storage
          .from('users')
          .getPublicUrl(existingAvatar.path)
        setAvatarImage({ ...existingAvatar, publicUrl: urlData.publicUrl })
      } else {
        setAvatarImage(null)
      }
    } else {
      reset(initialData)
      setAvatarImage(null)
    }
  }, [user, reset, images, initialData])

  const handleAvatarUpload = useCallback(
    (uploadResult: UploadResult | null, file?: File) => {
      if (uploadResult && file) {
        const { url: publicUrl, path, id: storageObjectId } = uploadResult
        setAvatarImage((prev: (Partial<Image> & { publicUrl?: string; file?: File }) | null) => ({
          ...prev,
          path,
          publicUrl,
          storage_object_id: storageObjectId,
          table_name: 'users',
          record_id: user?.id || '',
          type: 'avatar',
          alt_text: `${formData.full_name || formData.email} avatar`,
          file_size: file.size,
          mime_type: file.type,
          file
        }))
      } else {
        setAvatarImage(null)
      }
    },
    [user?.id, formData.full_name, formData.email]
  )

  const roleOptions = useMemo(() => [
    {
      value: USER_ROLES.USER,
      label: tCommon('roles.user'),
      icon: <User className='w-4 h-4' />
    },
    {
      value: USER_ROLES.MODERATOR,
      label: tCommon('roles.moderator'),
      icon: <Gavel className='w-4 h-4' />
    },
    {
      value: USER_ROLES.ADMIN,
      label: tCommon('roles.admin'),
      icon: <Shield className='w-4 h-4' />
    }
  ], [tCommon])

  // Extracted role select for both modes
  const RoleSelect = ({ value, onChange, error, disabled }: { value: UserRole; onChange: (value: UserRole) => void; error?: string; disabled?: boolean }) => (
    <Select
      label={t('userForm.userRolePermissions')}
      required
      value={value}
      onChange={val => onChange(val as UserRole)}
      options={roleOptions}
      disabled={!!disabled}
      error={error ?? ''}
    />
  )

  const handleFormSubmit = useCallback(async (data: typeof formData) => {
    setSubmitError(null) // Clear any existing errors
    
    // Remove try/catch that was swallowing validation errors
    // Let validation errors bubble up to prevent invalid user creation
    if (isInviteMode) {
      // Send email and role for invite
      await onSubmit({ email: data.email, role: data.role } as Omit<UserInsert, 'id'>, null)
    } else {
      await onSubmit(data, avatarImage)
    }
  }, [onSubmit, avatarImage, isInviteMode])

  return (
    <FormContainer>
      {/* Display form error if any */}
      <FormErrorBanner 
        error={submitError} 
        onDismiss={() => setSubmitError(null)}
        className='mb-6'
      />

      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6' noValidate>
      {/* Invite mode: Only show email field */}
      {isInviteMode ? (
        <>
          <div className="flex flex-col md:flex-row md:items-start md:space-x-8 space-y-4 md:space-y-0 w-full">
            <div className="flex-1 min-w-0">
              <FormField
                label={t('forms:labels.emailAddress')}
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange('email')}
                onBlur={handleBlur('email')}
                placeholder={tForm('placeholders.userEmail')}
                required
                disabled={isValidating}
                error={errors.email ?? ''}
                icon={<Mail className='w-5 h-5' />}
              />
            </div>
            <div className="w-full md:w-64 md:pl-2">
              <RoleSelect
                value={formData.role || USER_ROLES.MODERATOR}
                onChange={value => updateField('role', value as UserRole)}
                error={errors.role ?? ''}
                disabled={isValidating}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            {t('userForm.emailInviteHelpText')}
          </p>
        </>
      ) : (
        <>
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
                imageUrl={avatarImage?.publicUrl || avatarImage?.path || null}
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
              error={errors.email ?? ''}
              helperText={!user ? t('userForm.emailInviteHelpText') : ''}
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

            <RoleSelect
              value={formData.role || 'moderator'}
              onChange={value => updateField('role', value as UserRole)}
              error={errors.role ?? ''}
              disabled={isValidating}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              label={t('forms:labels.city')}
              name='city'
              value={formData.city || ''}
              onChange={handleChange('city')}
              onBlur={handleBlur('city')}
              placeholder={tForm('placeholders.enterCity')}
              disabled={isValidating}
              {...(errors.city && { error: errors.city })}
            />
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

          {/* Bio field */}
          <div className='space-y-2'>
            <label htmlFor='bio' className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              {t('forms:labels.bio')}
            </label>
            <textarea
              id='bio'
              name='bio'
              value={formData.bio || ''}
              onChange={e => updateField('bio', e.target.value)}
              onBlur={handleBlur('bio')}
              placeholder={tForm('placeholders.bio')}
              disabled={isValidating}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 resize-none'
            />
            {errors.bio && (
              <p className='text-sm text-red-600 dark:text-red-400'>{errors.bio}</p>
            )}
          </div>
        </>
      )}

        {/* Action buttons */}
        <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
          <Button
            type='button'
            variant='secondary'
            onClick={onCancel}
            disabled={isValidating}
            leftIcon={X}
            className='px-6 py-2'
          >
            {tCommon('actions.cancel')}
          </Button>
          
          <Button
            type='submit'
            variant='secondary'
            loading={isValidating}
            loadingText={isInviteMode ? t('userForm.sendingInvite') : t('userForm.updating')}
            leftIcon={isInviteMode ? Mail : Save}
            className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white'
            {...(submitError && { 'aria-describedby': 'form-error-description' })}
          >
            {isInviteMode ? t('userForm.sendInvitation') : t('userForm.updateUser')}
          </Button>
        </div>
      </form>
    </FormContainer>
  )
}

export default UserForm
