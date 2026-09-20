"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";
import { mutationError } from "@/lib/supabase/mutations";
import { paymentSchema } from "@/lib/validations/payments";
import type { PaymentStatusValue } from "@/lib/validations/payments";

export interface ActionState {
  error?: string;
}

export async function createPayment(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = paymentSchema.safeParse({
    playerId: formData.get("playerId"),
    label: formData.get("label"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const session = await getCurrentSession();
  if (!session?.clubId) return { error: "Aucun club associé à votre compte." };

  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({
    club_id: session.clubId,
    player_id: parsed.data.playerId,
    label: parsed.data.label,
    amount: parsed.data.amount,
    due_date: parsed.data.dueDate || null,
  });

  if (error) return { error: "Impossible de créer la cotisation : " + error.message };

  revalidatePath("/cotisations");
  return {};
}

export async function deletePayment(paymentId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .delete()
    .eq("id", paymentId)
    .select("id");

  const err = mutationError(error, data, "Impossible de supprimer la cotisation");
  if (err) return { error: err };

  revalidatePath("/cotisations");
  return {};
}

export async function setPaymentStatus(
  paymentId: string,
  status: PaymentStatusValue,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .update({ status, paid_at: status === "paye" ? new Date().toISOString() : null })
    .eq("id", paymentId)
    .select("id");

  const err = mutationError(error, data, "Impossible de mettre à jour le statut");
  if (err) return { error: err };

  revalidatePath("/cotisations");
  return {};
}
