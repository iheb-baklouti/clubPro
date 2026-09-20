"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";
import { mutationError } from "@/lib/supabase/mutations";

export interface ActionState {
  error?: string;
}

export async function addMatchPhoto(
  matchId: string,
  storagePath: string,
  caption: string,
): Promise<ActionState> {
  const session = await getCurrentSession();
  if (!session) return { error: "Session expirée." };

  const supabase = await createClient();
  const { error } = await supabase.from("match_photos").insert({
    match_id: matchId,
    storage_path: storagePath,
    caption: caption || null,
    uploaded_by: session.userId,
  });

  if (error) return { error: "Impossible d'enregistrer la photo : " + error.message };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}

export async function deleteMatchPhoto(photoId: string, matchId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("match_photos").delete().eq("id", photoId).select("id");

  const err = mutationError(error, data, "Impossible de supprimer la photo");
  if (err) return { error: err };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}
