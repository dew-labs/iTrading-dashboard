import type { Database } from './database'

// Database user types (for your users table)
export type DatabaseUser = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// User profile types
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

// User-specific enums/unions
export type UserRole = 'user' | 'admin';
export type UserStatus = 'invited' | 'active' | 'inactive';
