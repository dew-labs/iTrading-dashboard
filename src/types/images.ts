import type { Database } from './database'

// Image types
export type ImageRow = Database['public']['Tables']['images']['Row']
export type ImageInsert = Database['public']['Tables']['images']['Insert']
export type ImageUpdate = Database['public']['Tables']['images']['Update']

/**
 * Image type with optional blurhash property for placeholder rendering.
 */
export interface Image extends ImageRow {
  blurhash?: string;
}
