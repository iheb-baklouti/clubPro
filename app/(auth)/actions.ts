"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

export interface AuthActionState {
  error?: string;
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    clubName: formData.get("clubName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { fullName, email, password, clubName } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    if (error.code === "over_email_send_rate_limit") {
      return {
        error:
          "Trop de tentatives d'inscription en peu de temps (limite d'envoi d'emails Supabase). " +
          "Attendez quelques minutes avant de réessayer, ou configurez un fournisseur SMTP personnalisé " +
          "dans Supabase (Authentication > Emails) pour lever cette limite en développement/production.",
      };
    }
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { error: "Un compte existe déjà avec cet email." };
    }
    return { error: "Impossible de créer le compte : " + error.message };
  }

  if (!data.user) {
    return {
      error: "Vérifiez votre boîte mail pour confirmer votre compte, puis reconnectez-vous.",
    };
  }

  // Opération privilégiée (contourne RLS) : crée le club et promeut le
  // premier utilisateur en "direction". Jamais exposée côté client.
  const admin = createAdminClient();

  const { data: club, error: clubError } = await admin
    .from("clubs")
    .insert({ name: clubName })
    .select("id")
    .single();

  if (clubError || !club) {
    return { error: "Le compte a été créé mais le club n'a pas pu être initialisé." };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ club_id: club.id, role: "direction" })
    .eq("id", data.user.id);

  if (profileError) {
    return { error: "Le compte a été créé mais le rôle n'a pas pu être attribué." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
