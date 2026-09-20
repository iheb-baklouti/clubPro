"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";
import { mutationError } from "@/lib/supabase/mutations";
import { drillSchema } from "@/lib/validations/trainings";
import type { FormationData } from "@/lib/formations";
import type { Json } from "@/lib/types/database.types";

export interface ActionState {
  error?: string;
}

function parseDrillFormData(formData: FormData) {
  return drillSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category") || "technique",
    description: formData.get("description"),
    diagramUrl: formData.get("diagramUrl"),
  });
}

export async function createDrill(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseDrillFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const session = await getCurrentSession();
  if (!session?.clubId) return { error: "Aucun club associé à votre compte." };

  const supabase = await createClient();
  const { error } = await supabase.from("drills").insert({
    club_id: session.clubId,
    title: parsed.data.title,
    category: parsed.data.category,
    description: parsed.data.description || null,
    diagram_url: parsed.data.diagramUrl || null,
    created_by: session.userId,
  });

  if (error) return { error: "Impossible de créer l'exercice : " + error.message };

  revalidatePath("/drills");
  return {};
}

export async function updateDrill(
  drillId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseDrillFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drills")
    .update({
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description || null,
      diagram_url: parsed.data.diagramUrl || null,
    })
    .eq("id", drillId)
    .select("id");

  const err = mutationError(error, data, "Impossible de modifier l'exercice");
  if (err) return { error: err };

  revalidatePath("/drills");
  return {};
}

export async function updateDrillDiagram(drillId: string, data: FormationData): Promise<ActionState> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("drills")
    .update({ diagram_json: data as unknown as Json })
    .eq("id", drillId)
    .select("id");

  const err = mutationError(error, rows, "Impossible d'enregistrer le schéma");
  if (err) return { error: err };

  revalidatePath("/drills");
  revalidatePath(`/drills/${drillId}/schema`);
  return {};
}

export async function deleteDrill(drillId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("drills").delete().eq("id", drillId).select("id");

  const err = mutationError(error, data, "Impossible de supprimer l'exercice");
  if (err) return { error: err };

  revalidatePath("/drills");
  return {};
}
