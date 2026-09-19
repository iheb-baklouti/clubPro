import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

/**
 * Client Supabase avec la clé service_role : contourne RLS.
 * Usage strictement serveur (Server Actions / Route Handlers), jamais importé
 * depuis un composant client. Réservé aux opérations privilégiées explicites
 * (ex: création de club + promotion du premier utilisateur en "direction").
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
