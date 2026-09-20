"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";
import { mutationError } from "@/lib/supabase/mutations";
import { teamSchema, playerSchema } from "@/lib/validations/teams";

export interface ActionState {
  error?: string;
}

export async function createTeam(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = teamSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const session = await getCurrentSession();
  if (!session?.clubId) return { error: "Aucun club associé à votre compte." };

  const supabase = await createClient();
  const { error } = await supabase.from("teams").insert({
    club_id: session.clubId,
    name: parsed.data.name,
    category: parsed.data.category,
  });

  if (error) return { error: "Impossible de créer l'équipe : " + error.message };

  revalidatePath("/equipes");
  return {};
}

export async function updateTeam(
  teamId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = teamSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .update({ name: parsed.data.name, category: parsed.data.category })
    .eq("id", teamId)
    .select("id");

  const err = mutationError(error, data, "Impossible de modifier l'équipe");
  if (err) return { error: err };

  revalidatePath("/equipes");
  revalidatePath(`/equipes/${teamId}`);
  return {};
}

export async function deleteTeam(teamId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("teams").delete().eq("id", teamId).select("id");

  const err = mutationError(error, data, "Impossible de supprimer l'équipe");
  if (err) return { error: err };

  revalidatePath("/equipes");
  return {};
}

function parsePlayerFormData(formData: FormData) {
  return playerSchema.safeParse({
    fullName: formData.get("fullName"),
    birthDate: formData.get("birthDate"),
    position: formData.get("position"),
    jerseyNumber: formData.get("jerseyNumber"),
    status: formData.get("status") || "actif",
  });
}

export async function createPlayer(
  teamId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parsePlayerFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("players").insert({
    team_id: teamId,
    full_name: parsed.data.fullName,
    birth_date: parsed.data.birthDate || null,
    position: parsed.data.position || null,
    jersey_number: parsed.data.jerseyNumber ? Number(parsed.data.jerseyNumber) : null,
    status: parsed.data.status,
  });

  if (error) return { error: "Impossible d'ajouter le joueur : " + error.message };

  revalidatePath(`/equipes/${teamId}`);
  return {};
}

export async function updatePlayer(
  playerId: string,
  teamId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parsePlayerFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .update({
      full_name: parsed.data.fullName,
      birth_date: parsed.data.birthDate || null,
      position: parsed.data.position || null,
      jersey_number: parsed.data.jerseyNumber ? Number(parsed.data.jerseyNumber) : null,
      status: parsed.data.status,
    })
    .eq("id", playerId)
    .select("id");

  const err = mutationError(error, data, "Impossible de modifier le joueur");
  if (err) return { error: err };

  revalidatePath(`/equipes/${teamId}`);
  revalidatePath(`/equipes/${teamId}/joueurs/${playerId}`);
  return {};
}

export async function deletePlayer(playerId: string, teamId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("players").delete().eq("id", playerId).select("id");

  const err = mutationError(error, data, "Impossible de supprimer le joueur");
  if (err) return { error: err };

  revalidatePath(`/equipes/${teamId}`);
  return {};
}
