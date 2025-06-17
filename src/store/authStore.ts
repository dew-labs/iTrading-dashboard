import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { User } from '../types/database'

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  setDemoUser: () => void;
  getCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      set({ user: data.user, loading: false })
      return {}
    } catch {
      set({ loading: false })
      return { error: 'Login failed' }
    }
  },

  signUp: async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      set({ loading: false })
      return {}
    } catch {
      set({ loading: false })
      return { error: 'Sign up failed' }
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await supabase.auth.signOut()
      set({ user: null })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      set({ loading: false })
    }
  },

  setDemoUser: () => {
    // Create a demo user for development
    const demoUser = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      user_metadata: {
        full_name: 'Demo User'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      aud: 'authenticated',
      role: 'authenticated'
    } as User

    set({ user: demoUser })
  },

  initialize: async () => {
    try {
      // Check if we're in demo mode
      const isDemo =
        import.meta.env.VITE_SUPABASE_URL?.includes('demo-project') ||
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL ===
          'https://demo-project.supabase.co'

      if (isDemo) {
        // In demo mode, automatically set a demo user
        get().setDemoUser()
        set({ initialized: true })
        return
      }

      const {
        data: { session }
      } = await supabase.auth.getSession()
      set({ user: session?.user ?? null, initialized: true })

      supabase.auth.onAuthStateChange((event, session) => {
        set({ user: session?.user ?? null })
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      // In case of error, still set demo user for development
      get().setDemoUser()
      set({ initialized: true })
    }
  },

  getCurrentUser: async () => {
    // Implementation of getCurrentUser method
  }
}))
