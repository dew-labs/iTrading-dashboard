// Re-export all types from modular files
export * from './auth'
export * from './posts'
export * from './products'
export * from './banners'
export * from './users'
export * from './notifications'
export * from './images'

// Keep the main Database interface export
export type { Database } from './database'
