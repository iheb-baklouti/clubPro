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

export interface SequenceStep {
  id: string;
  label: string;
  timestampSeconds: number;
  data: FormationData;
}

export interface SequenceSummary {
  id: string;
  name: string;
  notes: string | null;
  team_id: string;
  teams: { name: string } | null;
  steps_json: Json;
}

export async function listSequences(): Promise<SequenceSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tactical_sequences")
    .select("id, name, notes, team_id, teams(name), steps_json")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createSequence(
  name: string,
  notes: string,
  teamId: string,
): Promise<ActionState & { id?: string }> {
  if (!name.trim()) return { error: "Le nom est requis." };
  if (!teamId) return { error: "Choisissez une équipe." };

  const session = await getCurrentSession();
  if (!session?.clubId) return { error: "Session expirée." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tactical_sequences")
    .insert({
      club_id: session.clubId,
      team_id: teamId,
      name: name.trim(),
      notes: notes.trim() || null,
      steps_json: [],
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Impossible de créer la séquence : " + error?.message };

  revalidatePath("/simulations");
  return { id: data.id };
}

export async function updateSequenceSteps(sequenceId: string, steps: SequenceStep[]): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tactical_sequences")
    .update({ steps_json: steps as unknown as Json, updated_at: new Date().toISOString() })
    .eq("id", sequenceId)
    .select("id");

  const err = mutationError(error, data, "Impossible d'enregistrer la séquence");
  if (err) return { error: err };

  revalidatePath(`/simulations/${sequenceId}`);
  return {};
}

export async function renameSequence(sequenceId: string, name: string, notes: string): Promise<ActionState> {
  if (!name.trim()) return { error: "Le nom est requis." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tactical_sequences")
    .update({ name: name.trim(), notes: notes.trim() || null })
    .eq("id", sequenceId)
    .select("id");

  const err = mutationError(error, data, "Impossible de renommer la séquence");
  if (err) return { error: err };

  revalidatePath("/simulations");
  revalidatePath(`/simulations/${sequenceId}`);
  return {};
}

export async function deleteSequence(sequenceId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tactical_sequences").delete().eq("id", sequenceId).select("id");

  const err = mutationError(error, data, "Impossible de supprimer la séquence");
  if (err) return { error: err };

  revalidatePath("/simulations");
  return {};
}
