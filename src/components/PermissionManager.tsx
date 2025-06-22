import React, { useState, useEffect } from 'react'
import { Shield, X, Plus, Trash2 } from 'lucide-react'
import { getUserPermissions, grantPermission, revokePermission } from '../services/userService'
import { usePermissions } from '../hooks/usePermissions'
import type { DatabaseUser, Permission } from '../types'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

interface PermissionManagerProps {
  user: DatabaseUser;
  onClose: () => void;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ user, onClose }) => {
  const { isSuperAdmin } = usePermissions()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [newResource, setNewResource] = useState('')
  const [newAction, setNewAction] = useState('read')
  const [isAdding, setIsAdding] = useState(false)

  const availableResources = [
    'posts', 'products', 'banners', 'users', 'notifications', 'permissions'
  ]

  const availableActions = [
    'read', 'create', 'update', 'delete'
  ]

  useEffect(() => {
    fetchPermissions()
  }, [user.id])

  const fetchPermissions = async () => {
    setLoading(true)
    try {
      const userPermissions = await getUserPermissions(user.id)
      setPermissions(userPermissions)
    } catch (_error) {
      toast.error('Failed to load permissions')
    } finally {
      setLoading(false)
    }
  }

  const handleGrant = async () => {
    if (!newResource) {
      toast.error('Please select a resource')
      return
    }

    const existingPermission = permissions.find(
      p => p.resource === newResource && p.action === newAction
    )

    if (existingPermission) {
      toast.error('Permission already exists')
      return
    }

    const { success } = await grantPermission(user.id, newResource, newAction)
    if (success) {
      await fetchPermissions()
      setNewResource('')
      setNewAction('read')
      setIsAdding(false)
    }
  }

  const handleRevoke = async (resource: string, action: string) => {
    const { success } = await revokePermission(user.id, resource, action)
    if (success) {
      await fetchPermissions()
    }
  }

  if (!isSuperAdmin()) {
    return (
      <div className="p-6 text-center">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Only super admins can manage permissions</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Manage Permissions</h3>
          <p className="text-sm text-gray-600 mt-1">
            User: {user.full_name || user.email} ({user.role})
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Current Permissions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Current Permissions</h4>
            <div className="space-y-2">
              {permissions.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No custom permissions assigned</p>
              ) : (
                permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {permission.resource}
                      </span>
                      <span className="text-sm text-gray-500">:</span>
                      <span className="text-sm text-gray-700">{permission.action}</span>
                    </div>
                    <button
                      onClick={() => handleRevoke(permission.resource, permission.action)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Revoke permission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add New Permission */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700">Add Permission</h4>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center text-sm text-gray-900 hover:text-black"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Permission
                </button>
              )}
            </div>

            {isAdding && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource
                    </label>
                    <select
                      value={newResource}
                      onChange={(e) => setNewResource(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      <option value="">Select resource</option>
                      {availableResources.map(resource => (
                        <option key={resource} value={resource}>
                          {resource.charAt(0).toUpperCase() + resource.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action
                    </label>
                    <select
                      value={newAction}
                      onChange={(e) => setNewAction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    >
                      {availableActions.map(action => (
                        <option key={action} value={action}>
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsAdding(false)
                      setNewResource('')
                      setNewAction('read')
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGrant}
                    className="px-4 py-2 text-white bg-gradient-to-r from-gray-900 to-black rounded-lg hover:from-black hover:to-gray-900 transition-colors"
                  >
                    Grant Permission
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Role Information */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Users also inherit permissions from their role ({user.role}).
              Custom permissions are in addition to role-based permissions.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default PermissionManager
