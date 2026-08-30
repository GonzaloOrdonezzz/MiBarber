import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rtukojnpmwyjutbjksma.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dWtvam5wbXd5anV0Ymprc21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMTAxNjAsImV4cCI6MjEwMzY4NjE2MH0.t9Zf0DH0SBBMbdr5uFAN8d8rfZrgPf6PeOcPTda4NT8';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
