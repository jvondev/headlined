import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_ANON_KEY; // Use service role key for server-side operations

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase URL and/or Service Role Key are not set in environment variables for server-side.');
}

export const serverSupabase = createClient(supabaseUrl || '', supabaseServiceRoleKey || '');
