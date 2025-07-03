import type { Database } from './database'

export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update']

export interface AuditFilters {
  user_id?: string
  user_email?: string
  table_name?: string
  action?: 'INSERT' | 'UPDATE' | 'DELETE'
  date_from?: string
  date_to?: string
  search?: string
  user_role?: 'admin' | 'moderator'
}

export interface AuditStats {
  total_activities: number
  activities_today: number
  activities_week: number
  most_active_user: {
    user_email: string
    activity_count: number
  }
  activity_by_table: Record<string, number>
  activity_by_action: Record<string, number>
  recent_activity: Array<{
    user_email: string
    table_name: string
    action: string
    created_at: string
  }>
}

export interface AuditLogWithDetails extends AuditLog {
  formatted_changes?: string[]
  severity?: 'low' | 'medium' | 'high'
}

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE'

export interface AuditTableConfig {
  name: string
  displayName: string
  icon: string
  color: string
}

export const AUDIT_TABLES: Record<string, AuditTableConfig> = {
  users: {
    name: 'users',
    displayName: 'Users',
    icon: 'Users',
    color: 'blue'
  },
  posts: {
    name: 'posts',
    displayName: 'Posts',
    icon: 'FileText',
    color: 'green'
  },
  products: {
    name: 'products',
    displayName: 'Products',
    icon: 'Package',
    color: 'purple'
  },
  brokers: {
    name: 'brokers',
    displayName: 'Brokers',
    icon: 'Building',
    color: 'orange'
  },
  banners: {
    name: 'banners',
    displayName: 'Banners',
    icon: 'Image',
    color: 'pink'
  },
  user_permissions: {
    name: 'user_permissions',
    displayName: 'User Permissions',
    icon: 'Shield',
    color: 'red'
  },
  role_permissions: {
    name: 'role_permissions',
    displayName: 'Role Permissions',
    icon: 'ShieldCheck',
    color: 'red'
  }
}

export const AUDIT_ACTIONS: Record<AuditAction, { label: string; color: string; icon: string }> = {
  INSERT: {
    label: 'Created',
    color: 'green',
    icon: 'Plus'
  },
  UPDATE: {
    label: 'Updated',
    color: 'blue',
    icon: 'Edit'
  },
  DELETE: {
    label: 'Deleted',
    color: 'red',
    icon: 'Trash2'
  }
}
