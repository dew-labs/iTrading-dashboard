import React, { useState } from 'react'
import type { DatabaseUser, UserInsert, UserRole, UserStatus } from '../types'
import { usePermissions } from '../hooks/usePermissions'

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
    status: user?.status || 'active'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required'
    }

    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const roleOptions: { value: UserRole; label: string; description: string }[] = [
    {
      value: 'user',
      label: 'User',
      description: 'Standard user with basic permissions'
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Administrator with management permissions'
    },
    ...(isSuperAdmin() ? [{
      value: 'super_admin' as UserRole,
      label: 'Super Admin',
      description: 'Full system access and permission management'
    }] : [])
  ]

  const statusOptions: { value: UserStatus; label: string; color: string }[] = [
    { value: 'invited', label: 'Invited', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' },
    { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!!user} // Can't change email for existing users
          className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
            errors.email ? 'border-red-300' : 'border-gray-300'
          } ${user ? 'bg-gray-50 cursor-not-allowed' : ''}`}
          placeholder="user@example.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        {!user && (
          <p className="mt-1 text-sm text-gray-500">
            An invitation will be sent to this email address
          </p>
        )}
      </div>

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="full_name"
          name="full_name"
          value={formData.full_name || ''}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
            errors.full_name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="John Doe"
        />
        {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
            errors.phone ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
          Role <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {roleOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                formData.role === option.value ? 'border-gray-900 bg-gray-50' : 'border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={formData.role === option.value}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  {option.label}
                </span>
                <span className="block text-sm text-gray-500">
                  {option.description}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-sm text-gray-500">Preview:</span>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              statusOptions.find(s => s.value === formData.status)?.color || ''
            }`}
          >
            {statusOptions.find(s => s.value === formData.status)?.label}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-gradient-to-r from-gray-900 to-black rounded-lg hover:from-black hover:to-gray-900 transition-colors"
        >
          {user ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  )
}

export default UserForm
