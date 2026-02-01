
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Ensure these variables are set in your environment (e.g., .env file)
// REACT_APP_SUPABASE_URL or VITE_SUPABASE_URL depending on your build tool.
// For this environment, we access process.env directly.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseKey;
}

// Create a single supabase client for interacting with your database
// We check if keys are present to avoid "supabaseUrl is required" error during initialization
export const supabase = isSupabaseConfigured()
    ? createClient(supabaseUrl!, supabaseKey!)
    : { 
        // Mock client to prevent crashes if imported but not configured
        from: () => ({ 
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            insert: () => Promise.resolve({ error: null })
        }) 
      } as any;
