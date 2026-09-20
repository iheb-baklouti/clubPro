"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { mutationError } from "@/lib/supabase/mutations";
import { trainingSchema, trainingExerciseSchema } from "@/lib/validations/trainings";
import type { AvailabilityStatusValue } from "@/lib/validations/matches";

export interface ActionState {
  error?: string;
}

export async function createTraining(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = trainingSchema.safeParse({
    teamId: formData.get("teamId"),
    date: formData.get("date"),
    type: formData.get("type") || "technique",
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("trainings").insert({
    team_id: parsed.data.teamId,
    date: parsed.data.date,
    type: parsed.data.type,
    description: parsed.data.description || null,
  });

  if (error) return { error: "Impossible de créer la séance : " + error.message };

  revalidatePath("/entrainements");
  return {};
}

export async function updateTraining(
  trainingId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = trainingSchema.safeParse({
    teamId: formData.get("teamId"),
    date: formData.get("date"),
    type: formData.get("type") || "technique",
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainings")
    .update({
      team_id: parsed.data.teamId,
      date: parsed.data.date,
      type: parsed.data.type,
      description: parsed.data.description || null,
    })
    .eq("id", trainingId)
    .select("id");

  const err = mutationError(error, data, "Impossible de modifier la séance");
  if (err) return { error: err };

  revalidatePath("/entrainements");
  revalidatePath(`/entrainements/${trainingId}`);
  return {};
}

export async function deleteTraining(trainingId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainings")
    .delete()
    .eq("id", trainingId)
    .select("id");

  const err = mutationError(error, data, "Impossible de supprimer la séance");
  if (err) return { error: err };

  revalidatePath("/entrainements");
  return {};
}

export async function setTrainingAvailability(
  trainingId: string,
  playerId: string,
  status: AvailabilityStatusValue,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_responses")
    .upsert(
      {
        event_id: trainingId,
        event_type: "entrainement",
        player_id: playerId,
        status,
        responded_at: new Date().toISOString(),
      },
      { onConflict: "event_id,event_type,player_id" },
    )
    .select("id");

  const err = mutationError(error, data, "Impossible d'enregistrer la disponibilité");
  if (err) return { error: err };

  revalidatePath(`/entrainements/${trainingId}`);
  return {};
}

export async function setAttendance(
  trainingId: string,
  playerId: string,
  present: boolean,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_attendance")
    .upsert(
      { training_id: trainingId, player_id: playerId, present },
      { onConflict: "training_id,player_id" },
    )
    .select("id");

  const err = mutationError(error, data, "Impossible d'enregistrer la présence");
  if (err) return { error: err };

  revalidatePath(`/entrainements/${trainingId}`);
  return {};
}

export async function addTrainingExercise(
  trainingId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = trainingExerciseSchema.safeParse({
    drillId: formData.get("drillId"),
    durationMinutes: formData.get("durationMinutes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();

  // NB : lecture du max courant puis insertion — en cas d'ajouts strictement
  // simultanés par deux coachs, deux exercices pourraient obtenir le même
  // order_index (ordre d'affichage instable, sans perte de données). Un
  // vrai verrou nécessiterait une transaction serialisable ; hors scope MVP
  // pour un usage mono-coach typique.
  const { data: last } = await supabase
    .from("training_exercises")
    .select("order_index")
    .eq("training_id", trainingId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("training_exercises").insert({
    training_id: trainingId,
    drill_id: parsed.data.drillId,
    duration_minutes: parsed.data.durationMinutes,
    order_index: (last?.order_index ?? -1) + 1,
  });

  if (error) return { error: "Impossible d'ajouter l'exercice : " + error.message };

  revalidatePath(`/entrainements/${trainingId}`);
  return {};
}

export async function removeTrainingExercise(
  trainingExerciseId: string,
  trainingId: string,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_exercises")
    .delete()
    .eq("id", trainingExerciseId)
    .select("id");

  const err = mutationError(error, data, "Impossible de retirer l'exercice");
  if (err) return { error: err };

  revalidatePath(`/entrainements/${trainingId}`);
  return {};
}
