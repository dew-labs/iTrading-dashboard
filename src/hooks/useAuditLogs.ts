import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AuditLog, AuditFilters, AuditStats } from '@/types/audits'
import { usePermissions } from './usePermissions'
import { toast } from '@/utils/toast'

const auditQueryKeys = {
  auditLogs: (filters?: AuditFilters) => ['audit-logs', filters ? JSON.stringify(filters) : 'no-filters'],
  auditStats: () => ['audit-stats'],
  auditLog: (id: string) => ['audit-log', id]
}

const fetchAuditLogs = async (filters?: AuditFilters): Promise<AuditLog[]> => {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id)
    }
    if (filters?.user_email) {
      query = query.ilike('user_email', `%${filters.user_email}%`)
    }
    if (filters?.table_name) {
      query = query.eq('table_name', filters.table_name)
    }
    if (filters?.action) {
      query = query.eq('action', filters.action)
    }
    if (filters?.user_role) {
      query = query.eq('user_role', filters.user_role)
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to)
    }
    if (filters?.search) {
      query = query.or(`user_email.ilike.%${filters.search}%,table_name.ilike.%${filters.search}%,record_id.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      throw error
    }

    return data as AuditLog[]
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
}

const fetchAuditStats = async (): Promise<AuditStats> => {
  const { data, error } = await supabase.rpc('get_audit_stats')

  if (error) {
    throw new Error(`Failed to fetch audit stats: ${error.message}`)
  }

  return data as unknown as AuditStats
}

const deleteAuditLogMutation = async (id: string): Promise<void> => {
  const { error } = await supabase.from('audit_logs').delete().eq('id', id)
  if (error) {
    throw error
  }
}

const deleteOldAuditLogsMutation = async (daysToKeep: number): Promise<number> => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const { count, error } = await supabase
    .from('audit_logs')
    .delete({ count: 'exact' })
    .lt('created_at', cutoffDate.toISOString())

  if (error) {
    throw new Error(`Failed to delete old audit logs: ${error.message}`)
  }

  return count || 0
}

export const useAuditLogs = (filters?: AuditFilters) => {
  const { can } = usePermissions()
  const queryClient = useQueryClient()

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [filters])

  const {
    data: auditLogs = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: auditQueryKeys.auditLogs(memoizedFilters),
    queryFn: () => fetchAuditLogs(memoizedFilters),
    enabled: can('audit_logs', 'read'),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2
  })

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: auditQueryKeys.auditStats(),
    queryFn: fetchAuditStats,
    enabled: can('audit_logs', 'read'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  })

  // Delete single audit log mutation (super admin only)
  const deleteMutation = useMutation({
    mutationFn: deleteAuditLogMutation,
    onMutate: async (deletedId) => {
      if (!can('audit_logs', 'delete')) {
        throw new Error('You do not have permission to delete audit logs')
      }

      await queryClient.cancelQueries({ queryKey: auditQueryKeys.auditLogs() })

      const previousAuditLogs = queryClient.getQueryData<AuditLog[]>(auditQueryKeys.auditLogs(memoizedFilters))

      // Optimistically remove the audit log
      queryClient.setQueryData<AuditLog[]>(auditQueryKeys.auditLogs(memoizedFilters), (old = []) =>
        old.filter(log => log.id !== deletedId)
      )

      return { previousAuditLogs }
    },
    onError: (error, variables, context) => {
      if (context?.previousAuditLogs) {
        queryClient.setQueryData(auditQueryKeys.auditLogs(memoizedFilters), context.previousAuditLogs)
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete audit log'
      toast.error(errorMessage)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: auditQueryKeys.auditLogs() })
      queryClient.invalidateQueries({ queryKey: auditQueryKeys.auditStats() })
      toast.success('Audit log deleted successfully')
    }
  })

  // Delete old audit logs mutation (super admin only)
  const deleteOldMutation = useMutation({
    mutationFn: deleteOldAuditLogsMutation,
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete old audit logs'
      toast.error(errorMessage)
    },
    onSuccess: (deletedCount) => {
      queryClient.invalidateQueries({ queryKey: auditQueryKeys.auditLogs() })
      queryClient.invalidateQueries({ queryKey: auditQueryKeys.auditStats() })
      toast.success(`Deleted ${deletedCount} old audit logs`)
    }
  })

  // Error handling for permissions
  const permissionError = !can('audit_logs', 'read')
    ? 'You do not have permission to view audit logs'
    : null

  return {
    auditLogs: permissionError ? [] : auditLogs,
    stats,
    loading,
    statsLoading,
    error: permissionError ? new Error(permissionError) : (error as Error | null),
    statsError: statsError as Error | null,
    deleteAuditLog: (id: string) => deleteMutation.mutateAsync(id),
    deleteOldAuditLogs: (daysToKeep: number) => deleteOldMutation.mutateAsync(daysToKeep),
    refetch,
    // Additional states for UI feedback
    isDeleting: deleteMutation.isPending,
    isDeletingOld: deleteOldMutation.isPending,
    canDelete: can('audit_logs', 'delete')
  }
}
