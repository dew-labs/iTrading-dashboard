import type { Database } from './database'

// Image types
export type Image = Database['public']['Tables']['images']['Row']
export type ImageInsert = Database['public']['Tables']['images']['Insert']
export type ImageUpdate = Database['public']['Tables']['images']['Update']
