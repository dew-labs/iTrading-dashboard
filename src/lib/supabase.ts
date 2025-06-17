import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For development/demo purposes, provide fallback to prevent crashes
const defaultUrl = 'https://demo-project.supabase.co';
const defaultKey = 'demo_anon_key_placeholder';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('demo-project')) {
  console.warn('⚠️  Supabase environment variables not configured properly. Using demo mode.');
  console.warn('Please set up your Supabase project and update the environment variables.');
}

export const supabase = createClient<Database>(
  supabaseUrl || defaultUrl, 
  supabaseAnonKey || defaultKey, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Auth helpers with error handling for demo mode
export const signIn = async (email: string, password: string) => {
  if (!supabaseUrl || supabaseUrl.includes('demo-project')) {
    return { 
      data: null, 
      error: { message: 'Demo mode: Please configure Supabase to enable authentication' }
    };
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email: string, password: string, metadata?: any) => {
  if (!supabaseUrl || supabaseUrl.includes('demo-project')) {
    return { 
      data: null, 
      error: { message: 'Demo mode: Please configure Supabase to enable authentication' }
    };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};