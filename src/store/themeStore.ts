import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme, ThemeState } from '../types'

/**
 * Apply theme to document element
 */
const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

/**
 * Theme Store
 * Manages application theme state with localStorage persistence
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light' as Theme,

      setTheme: (theme: Theme) => {
        set({ theme })
        applyTheme(theme)
      },

      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'light' ? 'dark' : 'light'
        get().setTheme(newTheme)
      }
    }),
    {
      name: 'itrading-theme',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Apply theme immediately on rehydration
        if (state?.theme) {
          applyTheme(state.theme)
        }
      }
    }
  )
)

/**
 * Initialize theme on app startup
 * Checks for saved theme or system preference
 */
export const initializeTheme = () => {
  // Check for saved theme first (synchronous)
  const savedThemeData = localStorage.getItem('itrading-theme')
  let theme: Theme = 'light'

  if (savedThemeData) {
    try {
      const parsed = JSON.parse(savedThemeData)
      theme = parsed.state?.theme || 'light'
    } catch {
      // If parsing fails, detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme = prefersDark ? 'dark' : 'light'
    }
  } else {
    // No saved theme, use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme = prefersDark ? 'dark' : 'light'
  }

  // Apply theme immediately for faster UI response
  applyTheme(theme)

  // Set theme in store (this will be overridden if zustand rehydrates with different value)
  const store = useThemeStore.getState()
  if (store.theme !== theme) {
    store.setTheme(theme)
  }
}
