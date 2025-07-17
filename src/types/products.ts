import type { Database } from './database'

// Product types
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export interface ProductTranslation {
  id: string
  product_id: string
  language_code: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type ProductWithTranslations = Product & { translations?: ProductTranslation[] }
