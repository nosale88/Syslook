import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client configuration
 * Uses environment variables for URL and API key
 */

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bpklymkhwnegrqucanyj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl) {
  console.error('Missing Supabase URL. Please check your .env file and ensure VITE_SUPABASE_URL is set.');
}

if (!supabaseKey) {
  console.error('Missing Supabase anon key. Please check your .env file and ensure VITE_SUPABASE_ANON_KEY is set.');
}

// Create and export Supabase client with options
let supabaseClient: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseKey) {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}

// Export the client
export const supabase: SupabaseClient = supabaseClient as SupabaseClient;

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseKey) && Boolean(supabaseUrl) && Boolean(supabaseClient);
}
