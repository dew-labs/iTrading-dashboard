import type { Database } from './database'

// Broker types
export type Broker = Database['public']['Tables']['brokers']['Row'];
export type BrokerInsert = Database['public']['Tables']['brokers']['Insert'];
export type BrokerUpdate = Database['public']['Tables']['brokers']['Update'];
