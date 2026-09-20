import { createClient } from "@/lib/supabase/server";

export interface CurrentSession {
  userId: string;
  clubId: string | null;
  playerId: string | null;
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
    .select("club_id, player_id")
    .eq("id", user.id)
    .single();

  return { userId: user.id, clubId: profile?.club_id ?? null, playerId: profile?.player_id ?? null };
}

export interface CurrentPlayerContext {
  userId: string;
  clubId: string | null;
  playerId: string;
  teamId: string;
}

/** Pour les pages du portail joueur : résout le joueur lié au compte
 * connecté. Retourne `null` si le compte n'est pas (ou plus) lié à un
 * joueur — la page appelante doit alors rediriger ou afficher un message. */
export async function getCurrentPlayerContext(): Promise<CurrentPlayerContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("club_id, player_id")
    .eq("id", user.id)
    .single();

  if (!profile?.player_id) return null;

  const { data: player } = await supabase
    .from("players")
    .select("team_id")
    .eq("id", profile.player_id)
    .single();

  if (!player) return null;

  return { userId: user.id, clubId: profile.club_id, playerId: profile.player_id, teamId: player.team_id };
}
