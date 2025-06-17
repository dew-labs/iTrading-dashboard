import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase, signIn, signOut, signUp } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  setDemoUser: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        return { error: error.message };
      }
      set({ user: data.user });
      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, metadata?: any) => {
    set({ loading: true });
    try {
      const { data, error } = await signUp(email, password, metadata);
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await signOut();
      set({ user: null });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ loading: false });
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
    } as User;
    
    set({ user: demoUser });
  },

  initialize: async () => {
    try {
      // Check if we're in demo mode
      const isDemo = import.meta.env.VITE_SUPABASE_URL?.includes('demo-project') || 
                     !import.meta.env.VITE_SUPABASE_URL ||
                     import.meta.env.VITE_SUPABASE_URL === 'https://demo-project.supabase.co';

      if (isDemo) {
        // In demo mode, automatically set a demo user
        get().setDemoUser();
        set({ initialized: true });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      set({ user: session?.user ?? null, initialized: true });

      supabase.auth.onAuthStateChange((event, session) => {
        set({ user: session?.user ?? null });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      // In case of error, still set demo user for development
      get().setDemoUser();
      set({ initialized: true });
    }
  },
}));