"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";
import { mutationError } from "@/lib/supabase/mutations";
import { taskSchema, type TaskStatusValue } from "@/lib/validations/tasks";

export interface ActionState {
  error?: string;
}

function parseAssignee(assignee: string | null) {
  if (!assignee) return { assigned_profile_id: null, assigned_player_id: null };
  const [kind, id] = assignee.split(":");
  if (kind === "profile") return { assigned_profile_id: id, assigned_player_id: null };
  if (kind === "player") return { assigned_profile_id: null, assigned_player_id: id };
  return { assigned_profile_id: null, assigned_player_id: null };
}

export async function createTask(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    teamId: formData.get("teamId"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const session = await getCurrentSession();
  if (!session?.clubId) return { error: "Aucun club associé à votre compte." };

  const assignee = parseAssignee(formData.get("assignee") as string | null);

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    club_id: session.clubId,
    team_id: parsed.data.teamId || null,
    title: parsed.data.title,
    description: parsed.data.description || null,
    due_date: parsed.data.dueDate || null,
    ...assignee,
  });

  if (error) return { error: "Impossible de créer la tâche : " + error.message };

  revalidatePath("/taches");
  return {};
}

export async function updateTask(
  taskId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    teamId: formData.get("teamId"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const assignee = parseAssignee(formData.get("assignee") as string | null);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({
      team_id: parsed.data.teamId || null,
      title: parsed.data.title,
      description: parsed.data.description || null,
      due_date: parsed.data.dueDate || null,
      ...assignee,
    })
    .eq("id", taskId)
    .select("id");

  const err = mutationError(error, data, "Impossible de modifier la tâche");
  if (err) return { error: err };

  revalidatePath("/taches");
  return {};
}

export async function deleteTask(taskId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("tasks").delete().eq("id", taskId).select("id");

  const err = mutationError(
    error,
    data,
    "Impossible de supprimer la tâche (réservé à la direction)",
  );
  if (err) return { error: err };

  revalidatePath("/taches");
  return {};
}

export async function setTaskStatus(
  taskId: string,
  status: TaskStatusValue,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId)
    .select("id");

  const err = mutationError(error, data, "Impossible de mettre à jour la tâche");
  if (err) return { error: err };

  revalidatePath("/taches");
  return {};
}
