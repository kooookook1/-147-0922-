import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://idaqnsigyjbgrxmkjaka.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jGkKZWjb_vHLzm6aAZAI8Q_SM1LPbp0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
