import { createClient } from "@/lib/supabase/server";

export interface CurrentSession {
  userId: string;
  clubId: string | null;
}

/** Récupère l'utilisateur courant et son club_id — remplace le pattern
 * répété "getUser() puis select club_id" dans chaque fichier d'actions. */
export async function getCurrentSession(): Promise<CurrentSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("club_id")
    .eq("id", user.id)
    .single();

  return { userId: user.id, clubId: profile?.club_id ?? null };
}
