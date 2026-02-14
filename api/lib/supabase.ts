/**
 * Client Supabase pour l'API (Vercel serverless).
 * Utilise SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (backend uniquement).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url === 'https://your-project.supabase.co') {
    return null;
  }
  if (!client) {
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
