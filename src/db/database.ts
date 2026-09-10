import { supabase } from '../lib/supabase';
import { clearAllCache } from './offline';

export async function clearDatabase(): Promise<void> {
  await clearAllCache();
  await supabase.auth.signOut();
}