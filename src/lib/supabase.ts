import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PlayerProgress {
  player_id: string;
  achievements_count: number;
  achievements: string[];
  day: number;
  house_capacity: number;
  player_name?: string | null;
  rabbits_common: number;
  rabbits_rare: number;
  rabbits_legendary: number;
  current_coins: number;
  total_rabbits_born: number;
  total_coins_earned: number;
  last_updated: string;
  created_at: string;
}
