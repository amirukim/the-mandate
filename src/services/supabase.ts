import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Cloud features activate only when both env values exist. Without them the
 * game runs fully local. The anon key is a public key; the service-role key
 * must never be placed in frontend env.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isCloudEnabled = supabase !== null;
