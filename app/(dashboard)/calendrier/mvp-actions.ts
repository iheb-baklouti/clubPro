"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";

export interface ActionState {
  error?: string;
}

export async function voteMvp(matchId: string, votedPlayerId: string): Promise<ActionState> {
  const session = await getCurrentSession();
  if (!session) return { error: "Session expirée." };

  const supabase = await createClient();
  const { error } = await supabase.from("match_mvp_votes").upsert(
    {
      match_id: matchId,
      voter_profile_id: session.userId,
      voted_player_id: votedPlayerId,
    },
    { onConflict: "match_id,voter_profile_id" },
  );

  if (error) return { error: "Impossible d'enregistrer le vote : " + error.message };

  revalidatePath(`/calendrier/${matchId}`);
  revalidatePath("/joueur/calendrier");
  return {};
}
