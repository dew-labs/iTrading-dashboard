import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Plus, Trash2, Key, FileText, Users, Package, Bell, AlertCircle, CheckCircle, Edit } from 'lucide-react'
import { getUserPermissions, grantPermission, revokePermission } from '../services/userService'
import { usePermissions } from '../hooks/usePermissions'
import { useTranslation } from '../hooks/useTranslation'
import type { DatabaseUser, Permission } from '../types'
import LoadingSpinner from './LoadingSpinner'
import Select from './Select'
import Badge from './Badge'
import { toast } from '../utils/toast'
import { getButtonClasses, getTypographyClasses, cn } from '../utils/theme'

interface PermissionManagerProps {
  user: DatabaseUser;
  onClose: () => void;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ user, onClose: _onClose }) => {
  const { t } = useTranslation()
  const { isSuperAdmin } = usePermissions()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [newResource, setNewResource] = useState('')
  const [newAction, setNewAction] = useState('read')
  const [isAdding, setIsAdding] = useState(false)

  const allResources = [
    { value: 'posts', label: t('permissionPosts'), icon: <FileText className="w-4 h-4" /> },
    { value: 'products', label: t('permissionProducts'), icon: <Package className="w-4 h-4" /> },
    { value: 'banners', label: t('permissionBanners'), icon: <Bell className="w-4 h-4" /> },
    { value: 'brokers', label: t('permissionBrokers'), icon: <Users className="w-4 h-4" /> },
    { value: 'users', label: t('permissionUsers'), icon: <Users className="w-4 h-4" /> },
    { value: 'notifications', label: t('permissionNotifications'), icon: <Bell className="w-4 h-4" /> },
    { value: 'permissions', label: t('permissionPermissions'), icon: <Shield className="w-4 h-4" /> },
    { value: 'profile', label: t('permissionProfile'), icon: <Users className="w-4 h-4" /> }
  ]

  const allActions = user.role === 'user'
    ? [{ value: 'read', label: t('read'), icon: <FileText className="w-3.5 h-3.5" /> }]
    : [
      { value: 'read', label: t('read'), icon: <FileText className="w-3.5 h-3.5" /> },
      { value: 'create', label: t('create'), icon: <Plus className="w-3.5 h-3.5" /> },
      { value: 'update', label: t('update'), icon: <Edit className="w-3.5 h-3.5" /> },
      { value: 'delete', label: t('delete'), icon: <Trash2 className="w-3.5 h-3.5" /> }
    ]

  // Filter available resources - only show those that have available actions
  const availableResources = allResources.filter(resource => {
    const existingActions = permissions
      .filter(p => p.resource === resource.value)
      .map(p => p.action)
    const availableActions = allActions.filter(action => !existingActions.includes(action.value))
    return availableActions.length > 0
  })

  // Filter available actions based on selected resource
  const availableActions = newResource
    ? allActions.filter(action => {
      const hasPermission = permissions.find(
        p => p.resource === newResource && p.action === action.value
      )
      return !hasPermission
    })
    : allActions

  const fetchPermissions = useCallback(async () => {
    setLoading(true)
    try {
      const userPermissions = await getUserPermissions(user.id)
      setPermissions(userPermissions)
    } catch (_error) {
      toast.error(t('failedToLoadPermissions'))
    } finally {
      setLoading(false)
    }
  }, [user.id, t])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  // Reset selected resource if it's no longer available
  useEffect(() => {
    if (newResource && !availableResources.find(r => r.value === newResource)) {
      setNewResource('')
    }
  }, [newResource, availableResources])

  // Reset selected action if it's no longer available
  useEffect(() => {
    if (newAction && !availableActions.find(a => a.value === newAction)) {
      setNewAction(availableActions[0]?.value || 'read')
    }
  }, [newAction, availableActions])

  const handleGrant = async () => {
    if (!newResource) {
      toast.error(t('pleaseSelectResource'))
      return
    }

    const existingPermission = permissions.find(
      p => p.resource === newResource && p.action === newAction
    )

    if (existingPermission) {
      toast.error(t('permissionAlreadyExists'))
      return
    }

    const { success } = await grantPermission(user.id, newResource, newAction)
    if (success) {
      await fetchPermissions()
      setNewResource('')
      setNewAction('read')
      setIsAdding(false)
      toast.success(t('permissionGrantedSuccessfully'))
    }
  }

  const handleRevoke = async (resource: string, action: string) => {
    const { success } = await revokePermission(user.id, resource, action)
    if (success) {
      await fetchPermissions()
      toast.success(t('permissionRevokedSuccessfully'))
    }
  }

  const getResourceIcon = (resource: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      posts: <FileText className="w-4 h-4" />,
      products: <Package className="w-4 h-4" />,
      banners: <Bell className="w-4 h-4" />,
      brokers: <Users className="w-4 h-4" />,
      users: <Users className="w-4 h-4" />,
      notifications: <Bell className="w-4 h-4" />,
      permissions: <Shield className="w-4 h-4" />,
      profile: <Users className="w-4 h-4" />
    }
    return iconMap[resource] || <Key className="w-4 h-4" />
  }

  const getActionIcon = (action: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      read: <FileText className="w-3.5 h-3.5" />,
      create: <Plus className="w-3.5 h-3.5" />,
      update: <Edit className="w-3.5 h-3.5" />,
      delete: <Trash2 className="w-3.5 h-3.5" />
    }
    return iconMap[action] || <Key className="w-3.5 h-3.5" />
  }

  // Group permissions by resource for better organization
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = []
    }
    acc[permission.resource]!.push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  if (!isSuperAdmin()) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className={cn(getTypographyClasses('h3'), 'text-gray-900 mb-2')}>
              {t('accessRestricted')}
            </h3>
            <p className={cn(getTypographyClasses('small'), 'text-gray-600')}>
              {t('onlySuperAdminsCanManage')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" variant="gradient" />
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Role Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className={cn(getTypographyClasses('small'), 'font-medium text-blue-900 mb-1')}>
                  {t('roleBasedPermissions')}
                </h4>
                <p className={cn(getTypographyClasses('small'), 'text-blue-800')}>
                  {user.role === 'user'
                    ? t('regularUsersReadOnly')
                    : t('userInheritsPermissions', { role: t(user.role === 'super_admin' ? 'superAdmin' : user.role) || user.role })
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Add New Permission */}
          {!isAdding && availableResources.length > 0 && (
            <div className="flex justify-start">
              <button
                onClick={() => setIsAdding(true)}
                className={getButtonClasses('primary', 'md')}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addPermission')}
              </button>
            </div>
          )}

          {availableResources.length === 0 && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className={cn(getTypographyClasses('small'), 'text-gray-600 font-medium')}>
                {t('allPermissionsGranted')}
              </p>
              <p className={cn(getTypographyClasses('small'), 'text-gray-500 mt-1')}>
                {user.role === 'user'
                  ? t('userHasAllAvailablePermissions')
                  : t('userHasAllPossiblePermissions')
                }
              </p>
            </div>
          )}

          {isAdding && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={t('resource')}
                  value={newResource}
                  onChange={setNewResource}
                  placeholder={t('forms:placeholders.selectResource')}
                  options={availableResources.map(resource => ({
                    value: resource.value,
                    label: resource.label,
                    icon: resource.icon
                  }))}
                />
                <Select
                  label={t('action')}
                  value={newAction}
                  onChange={setNewAction}
                  options={availableActions.map(action => ({
                    value: action.value,
                    label: action.label,
                    icon: action.icon
                  }))}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setNewResource('')
                    setNewAction('read')
                  }}
                  className={getButtonClasses('secondary', 'md')}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleGrant}
                  disabled={!newResource || availableActions.length === 0}
                  className={cn(
                    getButtonClasses('primary', 'md'),
                    (!newResource || availableActions.length === 0) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('grantPermission')}
                </button>
              </div>
            </div>
          )}

          {/* Current Permissions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className={cn(getTypographyClasses('h4'), 'text-gray-900')}>
                {t('customPermissions')}
              </h4>
              <div className="flex items-center space-x-2">
                <Badge variant="active" size="sm" showIcon>
                  {permissions.length} {t('permissions')}
                </Badge>
              </div>
            </div>

            {Object.keys(groupedPermissions).length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-gray-400" />
                </div>
                <p className={cn(getTypographyClasses('small'), 'text-gray-600')}>
                  {t('noCustomPermissions')}
                </p>
                <p className={cn(getTypographyClasses('small'), 'text-gray-500 mt-1')}>
                  {t('addPermissionsToCustomize')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                  <div key={resource} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getResourceIcon(resource)}
                      </div>
                      <div className="flex-1">
                        <h5 className={cn(getTypographyClasses('small'), 'font-medium text-gray-900 capitalize')}>
                          {t(`permission${resource.charAt(0).toUpperCase() + resource.slice(1)}`) || resource}
                        </h5>
                        <p className={cn(getTypographyClasses('small'), 'text-gray-500')}>
                          {resourcePermissions.length} {t('permissions')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {resourcePermissions.map((permission, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="text-gray-400">
                              {getActionIcon(permission.action)}
                            </div>
                            <span className={cn(getTypographyClasses('small'), 'font-medium text-gray-900 capitalize')}>
                              {t(permission.action)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRevoke(permission.resource, permission.action)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title={t('revokePermission')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PermissionManager
