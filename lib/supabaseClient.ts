import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

/**
 * Create a Supabase client with the user's Clerk token for RLS
 */
export const createSupabaseClient = (clerkToken?: string | null) => {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            // If token is provided, add it to Authorization header
            headers: clerkToken ? { Authorization: `Bearer ${clerkToken}` } : {},
        },
    });
};
