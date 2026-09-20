"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  inviteMemberSchema,
  roleUpdateSchema,
  type AssignableRole,
} from "@/lib/validations/users";

export interface ActionState {
  error?: string;
}

async function requireManagerClubId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("club_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.club_id || (profile.role !== "direction" && profile.role !== "admin")) {
    return null;
  }

  return { clubId: profile.club_id, userId: user.id };
}

export async function inviteMember(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role") || "coach",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const manager = await requireManagerClubId();
  if (!manager) return { error: "Réservé à la direction du club." };
  const { clubId } = manager;

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { full_name: parsed.data.fullName || null },
    // Les invites Supabase (déclenchées côté serveur avec la clé service_role)
    // livrent toujours la session en implicit flow (#access_token=... dans le
    // fragment d'URL), jamais via un ?code= PKCE — donc une redirection
    // directe ici, pas via /auth/callback. Voir SessionFromHashGate.
    redirectTo: `${siteUrl}/definir-mot-de-passe`,
  });

  if (error || !data.user) {
    if (error?.code === "email_exists") {
      return { error: "Un compte existe déjà avec cet email." };
    }
    return { error: "Impossible d'envoyer l'invitation : " + (error?.message ?? "erreur inconnue") };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ club_id: clubId, role: parsed.data.role })
    .eq("id", data.user.id);

  if (profileError) {
    return { error: "Invitation envoyée mais le rôle n'a pas pu être attribué." };
  }

  revalidatePath("/utilisateurs");
  return {};
}

export async function updateMemberRole(
  profileId: string,
  role: AssignableRole,
): Promise<ActionState> {
  const parsed = roleUpdateSchema.safeParse({ role });
  if (!parsed.success) {
    return { error: "Rôle invalide." };
  }

  const manager = await requireManagerClubId();
  if (!manager) return { error: "Réservé à la direction du club." };
  if (profileId === manager.userId) {
    return { error: "Vous ne pouvez pas modifier votre propre rôle." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", profileId)
    .eq("club_id", manager.clubId)
    .select("id");

  if (error) return { error: "Impossible de modifier le rôle : " + error.message };
  if (!data || data.length === 0) {
    return { error: "Membre introuvable dans votre club." };
  }

  revalidatePath("/utilisateurs");
  return {};
}

export async function revokeMemberAccess(profileId: string): Promise<ActionState> {
  const manager = await requireManagerClubId();
  if (!manager) return { error: "Réservé à la direction du club." };
  if (profileId === manager.userId) {
    return { error: "Vous ne pouvez pas révoquer votre propre accès." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({ club_id: null, role: "coach" })
    .eq("id", profileId)
    .eq("club_id", manager.clubId)
    .select("id");

  if (error) return { error: "Impossible de révoquer l'accès : " + error.message };
  if (!data || data.length === 0) {
    return { error: "Membre introuvable dans votre club." };
  }

  revalidatePath("/utilisateurs");
  return {};
}
