import React, { useState } from 'react'
import { User, Shield, Sparkles, X, Save, Mail } from 'lucide-react'
import type { DatabaseUser, UserInsert, UserRole } from '../types'
import { usePermissions } from '../hooks/usePermissions'
import { useTranslation } from '../hooks/useTranslation'
import { validators } from '../utils/format'
import { USER_ROLES } from '../constants/general'
import Input from './Input'
import Select from './Select'

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

  const roleOptions = [
    {
      value: USER_ROLES.USER,
      label: t('roles.user'),
      icon: <User className='w-4 h-4' />
    },
    {
      value: USER_ROLES.ADMIN,
      label: t('roles.admin'),
      icon: <Shield className='w-4 h-4' />
    },
    ...(isSuperAdmin()
      ? [
        {
          value: USER_ROLES.SUPER_ADMIN,
          label: t('roles.superAdmin'),
          icon: <Sparkles className='w-4 h-4' />
        }
      ]
      : [])
  ]

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Basic information in grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Input
          label={t('forms:labels.emailAddress')}
          type='email'
          name='email'
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='user@example.com'
          required
          disabled={!!user}
          {...(errors.email && { error: errors.email })}
          {...(!user && { helperText: t('userForm.emailInviteHelpText') })}
        />

        <Input
          label={t('forms:labels.fullName')}
          name='full_name'
          value={formData.full_name || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('forms:placeholders.fullNamePlaceholder')}
          required
          {...(errors.full_name && { error: errors.full_name })}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Input
          label={t('forms:labels.phoneNumber')}
          type='tel'
          name='phone'
          value={formData.phone || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='+1 (555) 123-4567'
          {...(errors.phone && { error: errors.phone })}
          helperText={t('userForm.phoneHelpText')}
        />

        <Select
          label={t('userForm.userRolePermissions')}
          required
          value={formData.role || 'user'}
          onChange={value => setFormData(prev => ({ ...prev, role: value as UserRole }))}
          options={roleOptions}
          disabled={isSubmitting}
        />
      </div>

      {/* Action buttons */}
      <div className='flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700'>
        <button
          type='button'
          onClick={onCancel}
          disabled={isSubmitting}
          className='px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
        >
          <X className='w-4 h-4 mr-2' />
          {t('actions.cancel')}
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className='px-6 py-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 text-white dark:text-gray-900 rounded-lg hover:from-black hover:to-gray-900 dark:hover:from-gray-100 dark:hover:to-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
        >
          {isSubmitting ? (
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
