import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const anon = () => createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const admin = () => createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
