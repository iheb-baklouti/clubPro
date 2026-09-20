"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";
import { mutationError } from "@/lib/supabase/mutations";

export interface ActionState {
  error?: string;
}

export async function updateClubLogo(logoUrl: string): Promise<ActionState> {
  const session = await getCurrentSession();
  if (!session?.clubId) return { error: "Aucun club associé à votre compte." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .update({ logo_url: logoUrl })
    .eq("id", session.clubId)
    .select("id");

  const err = mutationError(error, data, "Impossible d'enregistrer le logo");
  if (err) return { error: err };

  revalidatePath("/", "layout");
  return {};
}

export async function updateClubName(name: string): Promise<ActionState> {
  if (!name.trim()) return { error: "Le nom du club est requis." };

  const session = await getCurrentSession();
  if (!session?.clubId) return { error: "Aucun club associé à votre compte." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .update({ name: name.trim() })
    .eq("id", session.clubId)
    .select("id");

  const err = mutationError(error, data, "Impossible d'enregistrer le nom du club");
  if (err) return { error: err };

  revalidatePath("/", "layout");
  return {};
}

export async function addSponsor(name: string, logoUrl: string, websiteUrl: string): Promise<ActionState> {
  if (!name.trim()) return { error: "Le nom du sponsor est requis." };

  const session = await getCurrentSession();
  if (!session?.clubId) return { error: "Aucun club associé à votre compte." };

  const supabase = await createClient();
  const { error } = await supabase.from("sponsors").insert({
    club_id: session.clubId,
    name: name.trim(),
    logo_url: logoUrl || null,
    website_url: websiteUrl || null,
  });

  if (error) return { error: "Impossible d'ajouter le sponsor : " + error.message };

  revalidatePath("/club");
  return {};
}

export async function deleteSponsor(sponsorId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sponsors").delete().eq("id", sponsorId).select("id");

  const err = mutationError(error, data, "Impossible de supprimer le sponsor");
  if (err) return { error: err };

  revalidatePath("/club");
  return {};
}
