"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";

export interface ActionState {
  error?: string;
}

export async function saveScoutingNote(
  matchId: string,
  fields: { strengths: string; weaknesses: string; keyPlayers: string; notes: string },
): Promise<ActionState> {
  const session = await getCurrentSession();
  if (!session) return { error: "Session expirée." };

  const supabase = await createClient();
  const { error } = await supabase.from("match_scouting_notes").upsert(
    {
      match_id: matchId,
      strengths: fields.strengths || null,
      weaknesses: fields.weaknesses || null,
      key_players: fields.keyPlayers || null,
      notes: fields.notes || null,
      created_by: session.userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "match_id" },
  );

  if (error) return { error: "Impossible d'enregistrer les notes : " + error.message };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}
