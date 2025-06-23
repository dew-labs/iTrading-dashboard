import React, { useState } from 'react'
import { User, Shield, CheckCircle2, Sparkles, Users } from 'lucide-react'
import type { DatabaseUser, UserInsert, UserRole } from '../types'
import { usePermissions } from '../hooks/usePermissions'
import { validators } from '../utils/format'
import FormInput from './FormInput'

interface UserFormProps {
  user?: DatabaseUser | null;
  onSubmit: (data: UserInsert) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
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
      newErrors.email = 'Email is required'
    } else if (!validators.email(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!validators.required(formData.full_name)) {
      newErrors.full_name = 'Full name is required'
    }

    if (formData.phone && !validators.phone(formData.phone)) {
      newErrors.phone = 'Invalid phone number format. Use international format (e.g., +1 234 567 8900)'
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
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newErrors: Record<string, string> = { ...errors }

    // Validate specific field on blur
    switch (name) {
    case 'email':
      if (!validators.required(value)) {
        newErrors.email = 'Email is required'
      } else if (!validators.email(value)) {
        newErrors.email = 'Invalid email format'
      } else {
        delete newErrors.email
      }
      break

    case 'full_name':
      if (!validators.required(value)) {
        newErrors.full_name = 'Full name is required'
      } else {
        delete newErrors.full_name
      }
      break

    case 'phone':
      if (value && !validators.phone(value)) {
        newErrors.phone = 'Invalid phone number format. Use international format (e.g., +1 234 567 8900)'
      } else {
        delete newErrors.phone
      }
      break
    }

    setErrors(newErrors)
  }

  const roleOptions: { value: UserRole; label: string; description: string; icon: React.ReactNode; color: string }[] = [
    {
      value: 'user',
      label: 'User',
      description: 'Standard access with basic permissions',
      icon: <User className="w-5 h-5" />,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Enhanced access with management capabilities',
      icon: <Shield className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    ...(isSuperAdmin() ? [{
      value: 'super_admin' as UserRole,
      label: 'Super Admin',
      description: 'Complete system control and user management',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    }] : [])
  ]

  return (
    <div className="relative max-w-2xl mx-auto">
      {!user && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900">Super Admin Only</p>
              <p className="text-amber-700">
                Only super administrators can create new users in the dashboard.
                Regular users can sign up through the mobile application.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h4>

          <div className="grid gap-6 md:grid-cols-2">
            <FormInput
              name="email"
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              required
              disabled={!!user}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              icon="email"
              {...(errors.email && { error: errors.email })}
              {...(!user && { helpText: 'An invitation will be sent to this email address' })}
            />

            <FormInput
              name="full_name"
              label="Full Name"
              placeholder="John Doe"
              required
              value={formData.full_name || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              icon="user"
              {...(errors.full_name && { error: errors.full_name })}
            />
          </div>

          <FormInput
            name="phone"
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={formData.phone || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            icon="phone"
            {...(errors.phone && { error: errors.phone })}
            helpText="Optional. Use international format with country code"
          />
        </div>

        {/* Role Selection */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            User Role & Permissions
          </h4>

          <div className="grid gap-4">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={`
                  relative flex items-center p-4 border-2 rounded-xl cursor-pointer
                  transition-all duration-200 hover:shadow-md group
                  ${formData.role === option.value
                ? 'border-gray-900 bg-white shadow-md'
                : 'border-gray-200 hover:border-gray-300'
              }
                `}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={formData.role === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-lg mr-4
                  bg-gradient-to-br ${option.color} text-white shadow-lg
                  transition-transform group-hover:scale-105
                `}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h5 className="text-lg font-semibold text-gray-900">{option.label}</h5>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {formData.role === option.value && (
                  <CheckCircle2 className="w-6 h-6 text-gray-900" />
                )}
              </label>
            ))}
          </div>

          {!user && (
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Invitation Process</p>
                <p className="text-blue-700">
                  The user will receive an email invitation with setup instructions.
                  They'll be able to set their password during the account activation process.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl
                       hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl
                       hover:from-black hover:to-gray-900 transition-all duration-200
                       shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       flex items-center space-x-2 font-semibold min-w-[160px] justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>{user ? 'Updating...' : 'Sending Invite...'}</span>
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                <span>{user ? 'Update User' : 'Send Invitation'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserForm
