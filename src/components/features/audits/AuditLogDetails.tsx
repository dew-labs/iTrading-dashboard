import React from 'react'
import { User, Database, Edit, FileText, Plus, Trash2, Clock, Tag, Hash } from 'lucide-react'
import { formatDateLong } from '@/utils/format'
import { cn, getTypographyClasses } from '@/utils/theme'
import { AUDIT_TABLES, AUDIT_ACTIONS, type AuditLog } from '@/types/audits'
import { Badge } from '@/components/atoms'
import { usePageTranslation } from '@/hooks/useTranslation'

interface AuditLogDetailsProps {
  auditLog: AuditLog | null
  onClose: () => void
}

const AuditLogDetails: React.FC<AuditLogDetailsProps> = ({
  auditLog
}) => {
  const { t } = usePageTranslation()

  if (!auditLog) return null

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'DELETE': return 'suspended'
      case 'INSERT': return 'active'
      case 'UPDATE': return 'invited'
      default: return 'user'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT': return Plus
      case 'UPDATE': return Edit
      case 'DELETE': return Trash2
      default: return Edit
    }
  }

  const formatJsonValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'string') return value
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    if (typeof value === 'number') return value.toString()
    return JSON.stringify(value, null, 2)
  }

  const InfoCard: React.FC<{
    title: string
    icon: React.ComponentType<{ className?: string }>
    iconColor: string
    children: React.ReactNode
  }> = ({ title, icon: Icon, iconColor, children }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-lg", iconColor.includes('blue') ? 'bg-blue-50 dark:bg-blue-900/20' : iconColor.includes('green') ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800')}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <h3 className={cn(getTypographyClasses('h3'), 'text-gray-900 dark:text-white')}>
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )

  const InfoItem: React.FC<{
    label: string
    value: React.ReactNode
    icon?: React.ComponentType<{ className?: string }>
  }> = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between gap-3">
      <label className={cn(getTypographyClasses('small'), 'text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5 flex-shrink-0')}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <div className={cn(getTypographyClasses('base'), 'text-gray-900 dark:text-white text-right')}>
        {value}
      </div>
    </div>
  )

  const renderValueChanges = () => {
    if (auditLog.action === 'INSERT') {
      if (!auditLog.new_values) return null

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className={cn(getTypographyClasses('h3'), 'text-gray-900 dark:text-white')}>
              {t('audits.newRecordCreated')}
            </h3>
          </div>
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <pre className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap font-mono overflow-x-auto">
              {JSON.stringify(auditLog.new_values, null, 2)}
            </pre>
          </div>
        </div>
      )
    }

    if (auditLog.action === 'DELETE') {
      if (!auditLog.old_values) return null

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className={cn(getTypographyClasses('h3'), 'text-gray-900 dark:text-white')}>
              {t('audits.deletedRecordData')}
            </h3>
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <pre className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap font-mono overflow-x-auto">
              {JSON.stringify(auditLog.old_values, null, 2)}
            </pre>
          </div>
        </div>
      )
    }

    if (auditLog.action === 'UPDATE') {
      if (!auditLog.changed_fields || auditLog.changed_fields.length === 0) {
        return (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-sm">
            <div className="text-center">
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 inline-block mb-4">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className={cn(getTypographyClasses('h3'), 'text-gray-900 dark:text-white mb-2')}>
                {t('audits.noChangesRecorded')}
              </h3>
              <p className={cn(getTypographyClasses('base'), 'text-gray-500 dark:text-gray-400')}>
                {t('audits.noChangesDescription')}
              </p>
            </div>
          </div>
        )
      }

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className={cn(getTypographyClasses('h3'), 'text-gray-900 dark:text-white')}>
              {t('audits.fieldChanges')}
            </h3>
            <div className="ml-auto">
              <Badge variant="user">
                {auditLog.changed_fields.length} {auditLog.changed_fields.length === 1 ? t('audits.field') : t('audits.fields')}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {auditLog.changed_fields.map((field, index) => {
              const oldValue = auditLog.old_values ? (auditLog.old_values as Record<string, unknown>)[field] : undefined
              const newValue = auditLog.new_values ? (auditLog.new_values as Record<string, unknown>)[field] : undefined

              return (
                <div key={field} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className={cn(getTypographyClasses('base'), 'font-semibold text-gray-900 dark:text-white')}>
                        {field}
                      </span>
                      <span className={cn(getTypographyClasses('small'), 'text-gray-500 dark:text-gray-400 ml-auto')}>
                        {t('audits.changeNumber', { number: index + 1 })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                    {/* Previous Value */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <span className={cn(getTypographyClasses('small'), 'text-red-600 dark:text-red-400 font-medium')}>
                          {t('audits.previousValue')}
                        </span>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md p-3">
                        <pre className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap font-mono overflow-x-auto">
                          {formatJsonValue(oldValue)}
                        </pre>
                      </div>
                    </div>

                    {/* New Value */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <span className={cn(getTypographyClasses('small'), 'text-green-600 dark:text-green-400 font-medium')}>
                          {t('audits.newValue')}
                        </span>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-md p-3">
                        <pre className="text-sm text-green-800 dark:text-green-300 whitespace-pre-wrap font-mono overflow-x-auto">
                          {formatJsonValue(newValue)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      {/* Main Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <InfoCard
          title={t('audits.userInfo')}
          icon={User}
          iconColor="text-blue-600 dark:text-blue-400"
        >
          <InfoItem
            label={t('audits.emailAddress')}
            value={
              <span className="font-medium">
                {auditLog.user_email || t('audits.unknownUser')}
              </span>
            }
            icon={User}
          />

          {auditLog.user_role && (
            <InfoItem
              label={t('audits.role')}
              value={
                <Badge variant={auditLog.user_role as 'super_admin' | 'admin'} showIcon>
                  {auditLog.user_role === 'super_admin' ? t('audits.superAdmin') : t('audits.admin')}
                </Badge>
              }
              icon={Tag}
            />
          )}

          {auditLog.session_id && (
            <InfoItem
              label={t('audits.sessionId')}
              value={
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                  {auditLog.session_id}
                </code>
              }
              icon={Hash}
            />
          )}
        </InfoCard>

        {/* Action Information */}
        <InfoCard
          title={t('audits.actionInfo')}
          icon={Database}
          iconColor="text-green-600 dark:text-green-400"
        >
          <InfoItem
            label={t('audits.actionType')}
            value={
              <Badge variant={getActionBadgeVariant(auditLog.action)}>
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const ActionIcon = getActionIcon(auditLog.action)
                    return <ActionIcon className="w-3.5 h-3.5" />
                  })()}
                  <span className="font-medium">
                    {AUDIT_ACTIONS[auditLog.action as keyof typeof AUDIT_ACTIONS]?.label || auditLog.action}
                  </span>
                </div>
              </Badge>
            }
            icon={getActionIcon(auditLog.action)}
          />

          <InfoItem
            label={t('audits.targetTable')}
            value={
              <span className="font-medium">
                {AUDIT_TABLES[auditLog.table_name]?.displayName || auditLog.table_name}
              </span>
            }
            icon={Database}
          />

          <InfoItem
            label={t('audits.recordId')}
            value={
              <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                {auditLog.record_id}
              </code>
            }
            icon={Hash}
          />

          <InfoItem
            label={t('audits.timestamp')}
            value={
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {auditLog.created_at ? formatDateLong(auditLog.created_at) : t('audits.unknown')}
                </span>
              </div>
            }
            icon={Clock}
          />
        </InfoCard>
      </div>

      {/* Changes Section */}
      {renderValueChanges()}
    </div>
  )
}

export default AuditLogDetails
