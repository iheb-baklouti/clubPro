import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Point d'échange PKCE pour les liens d'invitation/magic link Supabase.
 * Sans cette route, le code renvoyé dans l'URL n'est jamais échangé contre
 * une session : le middleware redirige alors l'utilisateur vers /login avant
 * même qu'il atteigne /definir-mot-de-passe.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
