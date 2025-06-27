import type { Database } from './database'

// Notification types
export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

// User notification types
export type UserNotification = Database['public']['Tables']['user_notifications']['Row']
export type UserNotificationInsert = Database['public']['Tables']['user_notifications']['Insert']
export type UserNotificationUpdate = Database['public']['Tables']['user_notifications']['Update']
