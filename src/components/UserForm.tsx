import React, { useState } from 'react'
import { User, Shield, CheckCircle2, Users, Sparkles } from 'lucide-react'
import type { DatabaseUser, UserInsert, UserRole } from '../types'
import { usePermissions } from '../hooks/usePermissions'
import { useTranslation } from '../hooks/useTranslation'
import { validators } from '../utils/format'
import { USER_ROLES } from '../constants/general'
import FormInput from './FormInput'

interface UserFormProps {
  user?: DatabaseUser | null
  onSubmit: (data: UserInsert) => void
  onCancel: () => void
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const { t } = useTranslation()
  const { isSuperAdmin } = usePermissions()
  const [formData, setFormData] = useState<UserInsert>({
    email: user?.email || '',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
    status: 'invited' // Always set to invited for new users
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!validators.required(formData.email)) {
      newErrors.email = t('userForm.emailRequired')
    } else if (!validators.email(formData.email)) {
      newErrors.email = t('userForm.emailInvalidFormat')
    }

    if (!validators.required(formData.full_name)) {
      newErrors.full_name = t('userForm.fullNameRequired')
    }

    if (formData.phone && !validators.phone(formData.phone)) {
      newErrors.phone = t('userForm.phoneInvalidFormat')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        await onSubmit(formData)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newErrors: Record<string, string> = { ...errors }

    // Validate specific field on blur
    switch (name) {
    case 'email':
      if (!validators.required(value)) {
        newErrors.email = t('userForm.emailRequired')
      } else if (!validators.email(value)) {
        newErrors.email = t('userForm.emailInvalidFormat')
      } else {
        delete newErrors.email
      }
      break

    case 'full_name':
      if (!validators.required(value)) {
        newErrors.full_name = t('userForm.fullNameRequired')
      } else {
        delete newErrors.full_name
      }
      break

    case 'phone':
      if (value && !validators.phone(value)) {
        newErrors.phone = t('userForm.phoneInvalidFormat')
      } else {
        delete newErrors.phone
      }
      break
    }

    setErrors(newErrors)
  }

  const roleOptions: {
    value: UserRole
    label: string
    description: string
    icon: React.ReactNode
    color: string
  }[] = [
    {
      value: USER_ROLES.USER,
      label: t('roles.user'),
      description: t('roles.userRoleDescription'),
      icon: <User className='w-6 h-6' />,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      value: USER_ROLES.ADMIN,
      label: t('roles.admin'),
      description: t('roles.adminRoleDescription'),
      icon: <Shield className='w-6 h-6' />,
      color: 'from-purple-500 to-pink-500'
    },
    ...(isSuperAdmin()
      ? [
        {
          value: USER_ROLES.SUPER_ADMIN,
          label: t('roles.superAdmin'),
          description: t('roles.superAdminRoleDescription'),
          icon: <Sparkles className='w-6 h-6' />,
          color: 'from-orange-500 to-red-500'
        }
      ]
      : [])
  ]

  return (
    <div className='relative max-w-2xl mx-auto'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information */}
        <div className='bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 space-y-6'>
          <h4 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center'>
            <User className='w-5 h-5 mr-2 text-gray-600 dark:text-gray-400' />
            {t('userForm.basicInformation')}
          </h4>

          <div className='grid gap-6 md:grid-cols-2'>
            <FormInput
              name='email'
              label={t('forms:labels.emailAddress')}
              type='email'
              placeholder='user@example.com'
              required
              disabled={!!user}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              icon='email'
              {...(errors.email && { error: errors.email })}
              {...(!user && { helpText: t('userForm.emailInviteHelpText') })}
            />

            <FormInput
              name='full_name'
              label={t('forms:labels.fullName')}
              placeholder={t('forms:placeholders.fullNamePlaceholder')}
              required
              value={formData.full_name || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              icon='user'
              {...(errors.full_name && { error: errors.full_name })}
            />
          </div>

          <FormInput
            name='phone'
            label={t('forms:labels.phoneNumber')}
            type='tel'
            placeholder='+1 (555) 123-4567'
            value={formData.phone || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            icon='phone'
            {...(errors.phone && { error: errors.phone })}
            helpText={t('userForm.phoneHelpText')}
          />
        </div>

        {/* Role Selection */}
        <div className='bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 space-y-6'>
          <h4 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center'>
            <Shield className='w-5 h-5 mr-2 text-gray-600 dark:text-gray-400' />
            {t('userForm.userRolePermissions')}
          </h4>

          <div className='space-y-3'>
            {roleOptions.map(option => (
              <label
                key={option.value}
                className={`
                  relative flex items-center p-5 border-2 rounded-2xl cursor-pointer
                  transition-all duration-200 hover:shadow-lg group
                  ${
              formData.role === option.value
                ? 'border-gray-900 dark:border-white bg-white dark:bg-gray-700 shadow-lg ring-2 ring-gray-100 dark:ring-gray-600'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700'
              }
                `}
              >
                <input
                  type='radio'
                  name='role'
                  value={option.value}
                  checked={formData.role === option.value}
                  onChange={handleChange}
                  className='sr-only'
                />
                <div
                  className={`
                  flex items-center justify-center w-14 h-14 rounded-2xl mr-5
                  bg-gradient-to-br ${option.color} text-white shadow-lg
                  transition-all duration-200 group-hover:scale-105
                  ${formData.role === option.value ? 'scale-105' : ''}
                `}
                >
                  {option.icon}
                </div>
                <div className='flex-1'>
                  <h5 className='text-xl font-bold text-gray-900 dark:text-white mb-1'>{option.label}</h5>
                  <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed'>{option.description}</p>
                </div>
                {formData.role === option.value && (
                  <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 ml-4'>
                    <CheckCircle2 className='w-5 h-5' />
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700'>
          <button
            type='button'
            onClick={onCancel}
            disabled={isSubmitting}
            className='px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                       hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed font-semibold'
          >
            {t('actions.cancel')}
          </button>
          <button
            type='submit'
            disabled={isSubmitting}
            className='px-8 py-3 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-xl
                       hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white transition-all duration-200
                       shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       flex items-center space-x-2 font-semibold min-w-[160px] justify-center'
          >
            {isSubmitting ? (
              <>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white' />
                <span>{user ? t('userForm.updating') : t('userForm.sendingInvite')}</span>
              </>
            ) : (
              <>
                <Users className='w-5 h-5' />
                <span>{user ? t('userForm.updateUser') : t('userForm.sendInvitation')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserForm
