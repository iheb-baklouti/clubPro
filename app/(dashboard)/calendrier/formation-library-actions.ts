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

export interface FormationTemplateSummary {
  id: string;
  name: string;
  notes: string | null;
  formation_type: string;
  team_id: string | null;
  positions_json: Json;
  updated_at: string;
}

export async function listFormationTemplates(): Promise<FormationTemplateSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("formation_templates")
    .select("id, name, notes, formation_type, team_id, positions_json, updated_at")
    .order("updated_at", { ascending: false });

  return data ?? [];
}

export async function saveFormationTemplate(
  name: string,
  notes: string,
  teamId: string | null,
  data: FormationData,
): Promise<ActionState> {
  if (!name.trim()) return { error: "Le nom du modèle est requis." };

  const session = await getCurrentSession();
  if (!session?.clubId) return { error: "Aucun club associé à votre compte." };

  const supabase = await createClient();
  const { error } = await supabase.from("formation_templates").insert({
    club_id: session.clubId,
    team_id: teamId,
    name: name.trim(),
    notes: notes || null,
    formation_type: data.formationType,
    positions_json: data as unknown as Json,
    created_by: session.userId,
  });

  if (error) return { error: "Impossible d'enregistrer le modèle : " + error.message };

  revalidatePath("/calendrier");
  return {};
}

export async function duplicateFormationTemplate(templateId: string): Promise<ActionState> {
  const session = await getCurrentSession();
  if (!session?.clubId) return { error: "Aucun club associé à votre compte." };

  const supabase = await createClient();
  const { data: original, error: fetchError } = await supabase
    .from("formation_templates")
    .select("name, notes, formation_type, team_id, positions_json")
    .eq("id", templateId)
    .single();

  if (fetchError || !original) return { error: "Modèle introuvable." };

  const { error } = await supabase.from("formation_templates").insert({
    club_id: session.clubId,
    team_id: original.team_id,
    name: `${original.name} (copie)`,
    notes: original.notes,
    formation_type: original.formation_type,
    positions_json: original.positions_json,
    created_by: session.userId,
  });

  if (error) return { error: "Impossible de dupliquer le modèle : " + error.message };

  revalidatePath("/calendrier");
  return {};
}

export async function deleteFormationTemplate(templateId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("formation_templates")
    .delete()
    .eq("id", templateId)
    .select("id");

  const err = mutationError(error, data, "Impossible de supprimer le modèle");
  if (err) return { error: err };

  revalidatePath("/calendrier");
  return {};
}
