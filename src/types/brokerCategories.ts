import type { Database } from './database'

// Broker category types
export type BrokerCategory = Database['public']['Tables']['broker_categories']['Row']
export type BrokerCategoryInsert = Database['public']['Tables']['broker_categories']['Insert']
export type BrokerCategoryUpdate = Database['public']['Tables']['broker_categories']['Update']