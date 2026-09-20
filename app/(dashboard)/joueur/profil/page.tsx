import { redirect } from "next/navigation";

import { getCurrentPlayerContext } from "@/lib/supabase/session";

export default async function JoueurProfilPage() {
  const ctx = await getCurrentPlayerContext();
  if (!ctx) redirect("/login");

  redirect(`/equipes/${ctx.teamId}/joueurs/${ctx.playerId}`);
}
