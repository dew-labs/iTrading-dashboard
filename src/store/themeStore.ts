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
  // Give zustand time to rehydrate from localStorage
  setTimeout(() => {
    const store = useThemeStore.getState()

    const savedTheme = localStorage.getItem('itrading-theme')

    if (!savedTheme) {
      // No saved theme, use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initialTheme = prefersDark ? 'dark' : 'light'
      store.setTheme(initialTheme)
    } else {
      // Apply current theme from store (which should be rehydrated by now)
      applyTheme(store.theme)
    }
  }, 100) // Small delay to ensure zustand has rehydrated
}
