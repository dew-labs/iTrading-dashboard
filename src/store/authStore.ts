import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { DatabaseUser } from '../types'
import { toast } from '../utils/toast'

/**
 * Auth Store with Deleted User Protection
 *
 * This store handles authentication state and includes specific protection
 * against infinite API loops when a user's account has been deleted from
 * the database but their browser session still exists.
 *
 * Key Features:
 * - Automatic sign-out when user profile is not found (deleted accounts)
 * - JWT/session error handling with user-friendly messages
 * - React Query cache clearing on sign-out to prevent stale data
 * - Comprehensive error handling for auth-related issues
 */

interface AuthState {
  user: User | null;
  profile: DatabaseUser | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  clearUserCache?: () => void;
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

  signOut: async () => {
    set({ loading: true })
    try {
      await supabase.auth.signOut()
      set({ user: null, profile: null })

      // Clear React Query cache to prevent stale data issues
      if (get().clearUserCache) {
        get().clearUserCache!()
      }
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

      if (error) {
        // Handle specific errors for deleted users
        if (error.code === 'PGRST116' || error.message.includes('No rows found')) {
          // User profile doesn't exist in database - sign them out
          console.warn('User profile not found in database. Signing out user:', user.email)
          toast.error('Your account has been removed. Please contact your administrator.', {
            duration: 5000
          })
          await get().signOut()
          return
        }

        // Handle other potential auth errors
        if (error.message.includes('JWT') || error.message.includes('invalid') || error.message.includes('expired')) {
          console.warn('Authentication error detected. Signing out user:', error.message)
          toast.error('Your session has expired. Please sign in again.', {
            duration: 4000
          })
          await get().signOut()
          return
        }

        throw error
      }

      set({ profile: data })
    } catch (error) {
      console.error('Error fetching user profile:', error)

      // If it's a critical auth error, sign out the user
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
      if (errorMessage.includes('unauthorized') ||
          errorMessage.includes('forbidden') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('expired')) {
        console.warn('Critical auth error detected. Signing out user.')
        toast.error('Authentication error. Please sign in again.', {
          duration: 4000
        })
        await get().signOut()
      }
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
