import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { AUDIT_TABLES, AUDIT_ACTIONS, type AuditLog } from '@/types/audits'
import { usePermissions } from './usePermissions'

interface RecentActivityItem {
  id: string
  type: string
  action: string
  user: string
  timestamp: string
  details?: string
  tableName: string
  recordId: string
}

const fetchRecentActivity = async (): Promise<AuditLog[]> => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    return data as AuditLog[]
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return []
  }
}

const formatTimestamp = (timestamp: string): string => {
  const now = new Date()
  const auditDate = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - auditDate.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) {
    return 'now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days}d`
  }
}

export const useRecentActivity = () => {
  const { can } = usePermissions()

  const {
    data: auditLogs = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: fetchRecentActivity,
    enabled: can('audit_logs', 'read'),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 2
  })

    // Transform audit logs into notification format
  const recentActivity: RecentActivityItem[] = useMemo(() => {
    return auditLogs.map((log): RecentActivityItem => {
      const tableConfig = AUDIT_TABLES[log.table_name] || {
        name: log.table_name,
        displayName: log.table_name,
        icon: 'Activity',
        color: 'gray'
      }

      const actionConfig = AUDIT_ACTIONS[log.action as keyof typeof AUDIT_ACTIONS]

      const actionText = `${actionConfig?.label || log.action.toLowerCase()} ${tableConfig.displayName.toLowerCase().slice(0, -1)}`

            // Extract resource name from new_values JSON
      const getResourceName = (): string | undefined => {
        if (!log.new_values || typeof log.new_values !== 'object') {
          return undefined
        }

        const values = log.new_values as Record<string, unknown>

        switch (log.table_name) {
          case 'users':
            return (values.full_name as string) || (values.email as string)
          case 'posts':
            return values.title as string
          case 'products':
          case 'brokers':
          case 'banners':
            return values.name as string
          case 'user_permissions':
          case 'role_permissions':
            return `${(values.resource as string) || ''} ${(values.action as string) || ''}`.trim()
          default:
            return undefined
        }
      }

      const resourceName = getResourceName()

      return {
        id: log.id,
        type: log.table_name,
        action: actionText,
        user: log.user_email || 'System',
        timestamp: formatTimestamp(log.created_at || new Date().toISOString()),
        ...(resourceName && { details: resourceName }),
        tableName: log.table_name,
        recordId: log.record_id || ''
      }
    })
  }, [auditLogs])

  // Error handling for permissions
  const permissionError = !can('audit_logs', 'read')
    ? 'You do not have permission to view recent activity'
    : null

  return {
    recentActivity: permissionError ? [] : recentActivity,
    loading,
    error: permissionError ? new Error(permissionError) : (error as Error | null),
    refetch,
    hasPermission: can('audit_logs', 'read')
  }
}
