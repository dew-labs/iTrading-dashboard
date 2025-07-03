import React from 'react'
import { Clock, Eye, Trash2, Plus, Edit } from 'lucide-react'
import { formatDateDisplay, formatRelativeTime } from '@/utils/format'
import { cn, getTypographyClasses } from '@/utils/theme'
import { AUDIT_TABLES, AUDIT_ACTIONS, type AuditLog } from '@/types/audits'
import { Badge } from '@/components/atoms'
import { Table } from '@/components/molecules'
import { usePageTranslation } from '@/hooks/useTranslation'

interface AuditLogTableProps {
  auditLogs: AuditLog[]
  loading: boolean
  totalPages: number
  currentPage: number
  itemsPerPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onViewDetails: (auditLog: AuditLog) => void
  onDeleteLog?: (id: number) => void
  canDelete?: boolean
  className?: string
}

const AuditLogTable: React.FC<AuditLogTableProps> = ({
  auditLogs,
  loading,
  totalPages: _totalPages,
  currentPage: _currentPage,
  itemsPerPage: _itemsPerPage,
  totalItems: _totalItems,
  onPageChange: _onPageChange,
  onViewDetails,
  onDeleteLog,
  canDelete = false,
  className
}) => {
  const { t } = usePageTranslation()

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

  const getTableDisplayName = (tableName: string) => {
    return AUDIT_TABLES[tableName]?.displayName || tableName
  }

  const getSeverityColor = (auditLog: AuditLog) => {
    // Determine severity based on action and table
    if (auditLog.action === 'DELETE') return 'red'
    if (auditLog.table_name === 'users' || auditLog.table_name === 'user_permissions') return 'orange'
    if (auditLog.action === 'INSERT') return 'green'
    return 'blue'
  }

  const columns = [
    {
      header: t('audits.when'),
      accessor: 'created_at' as keyof AuditLog,
      sortable: true,
      render: (value: unknown) => (
        <div className="space-y-1">
          <div className={cn(getTypographyClasses('small'), 'font-medium')}>
            {formatRelativeTime(value as string)}
          </div>
          <div className={cn(getTypographyClasses('xs'), 'text-gray-500 dark:text-gray-400')}>
            {formatDateDisplay(value as string)}
          </div>
        </div>
      )
    },
    {
      header: t('audits.who'),
      accessor: 'user_email' as keyof AuditLog,
      sortable: true,
      render: (value: unknown, row: AuditLog) => (
        <div className="space-y-1">
          <div className={cn(getTypographyClasses('small'), 'font-medium')}>
            {value as string || t('audits.unknown')}
          </div>
          {row.user_role && (
                            <Badge variant={row.user_role as 'moderator' | 'admin'} size="sm" showIcon>
                  {row.user_role === 'moderator' ? t('audits.moderator') : t('audits.admin')}
            </Badge>
          )}
        </div>
      )
    },
    {
      header: t('audits.whatHappened'),
      accessor: 'action' as keyof AuditLog,
      sortable: true,
      render: (value: unknown, row: AuditLog) => {
        const action = value as string
        const ActionIcon = getActionIcon(action)
        const actionConfig = AUDIT_ACTIONS[action as keyof typeof AUDIT_ACTIONS]

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={getActionBadgeVariant(action)} size="sm">
                <div className="flex items-center gap-1">
                  <ActionIcon className="w-3 h-3" />
                  <span>{actionConfig?.label || action}</span>
                </div>
              </Badge>
            </div>
            <div className={cn(getTypographyClasses('xs'), 'text-gray-500 dark:text-gray-400')}>
              {t('audits.on')} {getTableDisplayName(row.table_name)}
            </div>
          </div>
        )
      }
    },
    {
      header: t('audits.target'),
      accessor: 'record_id' as keyof AuditLog,
      sortable: false,
      render: (value: unknown, row: AuditLog) => (
        <div className="space-y-1">
          <div className={cn(getTypographyClasses('small'), 'font-medium')}>
            {getTableDisplayName(row.table_name)}
          </div>
          <div className={cn(getTypographyClasses('xs'), 'text-gray-500 dark:text-gray-400 font-mono')}>
            ID: {value as string}
          </div>
        </div>
      )
    },
    {
      header: t('audits.changes'),
      accessor: 'changed_fields' as keyof AuditLog,
      sortable: false,
      render: (value: unknown, row: AuditLog) => {
        const fields = value as string[] | null
        const severity = getSeverityColor(row)

        // For INSERT and DELETE actions, show N/A
        if (row.action === 'INSERT' || row.action === 'DELETE') {
          return (
            <span className={cn(getTypographyClasses('small'), 'text-gray-400 dark:text-gray-500')}>
              {t('audits.notApplicable')}
            </span>
          )
        }

        // For UPDATE actions, show field badges
        if (row.action === 'UPDATE' && fields && fields.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {fields.slice(0, 3).map((field, index) => (
                <span
                  key={index}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    severity === 'red' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                    severity === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  )}
                >
                  {field}
                </span>
              ))}
              {fields.length > 3 && (
                <span className={cn(
                  'px-2 py-1 rounded text-xs font-medium',
                  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                )}>
                  {t('audits.moreFields', { count: fields.length - 3 })}
                </span>
              )}
            </div>
          )
        }

        // Fallback for other cases
        return (
          <span className={cn(getTypographyClasses('small'), 'text-gray-400 dark:text-gray-500')}>
            {t('audits.notApplicable')}
          </span>
        )
      }
    },
    {
      header: t('audits.actions'),
      accessor: 'id' as keyof AuditLog,
      sortable: false,
      render: (value: unknown, row: AuditLog) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(row)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title={t('audits.viewDetails')}
          >
            <Eye className="w-4 h-4" />
          </button>
          {canDelete && onDeleteLog && (
            <button
              onClick={() => onDeleteLog(row.id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title={t('audits.deleteLog')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg mb-2"></div>
          ))}
        </div>
      </div>
    )
  }

  if (auditLogs.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Clock className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className={cn(getTypographyClasses('h3'), 'text-gray-500 dark:text-gray-400 mb-2')}>
          {t('audits.noRecentActivities')}
        </h3>
        <p className={cn(getTypographyClasses('base'), 'text-gray-400 dark:text-gray-500')}>
          {t('audits.activitiesWillAppear')}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Table
        data={auditLogs}
        columns={columns}
      />
    </div>
  )
}

export default AuditLogTable
