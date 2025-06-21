import type { Database } from './database'

// Post types
export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];

// Post-specific enums/unions
export type PostType = 'news' | 'event' | 'terms_of_use' | 'privacy_policy';
