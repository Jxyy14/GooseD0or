import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rtgfwhqkgdiopmjufneu.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Z2Z3aHFrZ2Rpb3BtanVmbmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NDY1MzcsImV4cCI6MjA3NzMyMjUzN30.2cg1o0mO-MwG-7rONAvcQ1pdGIAAh_1m3swHQILp8iM';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});