"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";

export interface ActionState {
  error?: string;
}

export async function sendMessage(
  teamId: string | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "Le message ne peut pas être vide." };

  const session = await getCurrentSession();
  if (!session) return { error: "Session expirée." };
  if (!session.clubId) return { error: "Aucun club associé à votre compte." };

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    club_id: session.clubId,
    team_id: teamId,
    sender_id: session.userId,
    content,
  });

  if (error) return { error: "Impossible d'envoyer le message : " + error.message };

  revalidatePath("/messagerie");
  return {};
}
