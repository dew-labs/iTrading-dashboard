import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { DatabaseUser } from '../types'

interface AuthState {
  user: User | null;
  profile: DatabaseUser | null;
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

  getCurrentUser: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
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

      set({ user: data.user })

      // Fetch user profile after successful login
      await get().fetchUserProfile()

      // Update last login
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
      }

      set({ loading: false })
      return {}
    } catch {
      set({ loading: false })
      return { error: 'Login failed' }
    }
  },

  signUp: async (email: string, password: string, metadata?: Record<string, unknown>) => {
    set({ loading: true })
    try {
      const signUpData: { email: string; password: string; options?: { data?: object } } = {
        email,
        password
      }

      if (metadata) {
        signUpData.options = { data: metadata }
      }

      const { error } = await supabase.auth.signUp(signUpData)

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
      set({ user: null, profile: null })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      set({ loading: false })
    }
  },

  fetchUserProfile: async () => {
    const { user } = get()
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      set({ profile: data })
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  },

  initialize: async () => {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (session?.user) {
        set({ user: session.user })
        await get().fetchUserProfile()
      }

      set({ initialized: true })

      supabase.auth.onAuthStateChange(async (event, session) => {
        const currentUser = get().user
        const newUser = session?.user ?? null

        // Only update if user actually changed to prevent unnecessary re-renders
        if (currentUser?.id !== newUser?.id) {
          set({ user: newUser })
          if (newUser) {
            await get().fetchUserProfile()
          } else {
            set({ profile: null })
          }
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ initialized: true })
    }
  },

  getCurrentUser: async () => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (user) {
      set({ user })
      await get().fetchUserProfile()
    }
  }
}))
