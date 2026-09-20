"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";
import { mutationError } from "@/lib/supabase/mutations";
import type { FormationData } from "@/lib/formations";
import type { Json } from "@/lib/types/database.types";

export interface ActionState {
  error?: string;
}

export async function createTacticalSnapshot(
  matchId: string,
  label: string,
  timestampSeconds: number,
  data: FormationData,
): Promise<ActionState> {
  if (!label.trim()) return { error: "Le libellé est requis." };

  const session = await getCurrentSession();
  if (!session) return { error: "Session expirée." };

  const supabase = await createClient();

  const { count } = await supabase
    .from("match_tactical_snapshots")
    .select("id", { count: "exact", head: true })
    .eq("match_id", matchId);

  const { error } = await supabase.from("match_tactical_snapshots").insert({
    match_id: matchId,
    label: label.trim(),
    timestamp_seconds: Math.max(0, Math.round(timestampSeconds)),
    order_index: count ?? 0,
    positions_json: data as unknown as Json,
    created_by: session.userId,
  });

  if (error) return { error: "Impossible d'enregistrer l'instantané : " + error.message };

  revalidatePath(`/calendrier/${matchId}/timeline`);
  return {};
}

export async function deleteTacticalSnapshot(
  snapshotId: string,
  matchId: string,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_tactical_snapshots")
    .delete()
    .eq("id", snapshotId)
    .select("id");

  const err = mutationError(error, data, "Impossible de supprimer l'instantané");
  if (err) return { error: err };

  revalidatePath(`/calendrier/${matchId}/timeline`);
  return {};
}
