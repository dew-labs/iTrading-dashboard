// Re-export all types from modular files
export * from './auth'
export * from './posts'
export * from './products'
export * from './banners'
export * from './users'
export * from './images'
export * from './brokers'
export * from './audits'

// Keep the main Database interface export
export type { Database } from './database'

/**
 * Theme Types
 */
export type Theme = 'light' | 'dark'

export interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}
