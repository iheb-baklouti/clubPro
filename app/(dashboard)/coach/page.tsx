import { CalendarDays, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/features/dashboard/stat-card";

export default async function CoachDashboardPage() {
  const supabase = await createClient();
  const [{ count: upcomingMatches }, { count: teamsCount }] = await Promise.all([
    supabase.from("matches").select("id", { count: "exact", head: true }).eq("status", "a_venir"),
    supabase.from("teams").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord — Coach</h1>
        <p className="text-muted-foreground">Votre équipe en un coup d&apos;œil.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          href="/calendrier"
          icon={CalendarDays}
          label="Prochains matchs à venir"
          value={upcomingMatches ?? 0}
          accent="live"
        />
        <StatCard href="/equipes" icon={Users} label="Équipes encadrées" value={teamsCount ?? 0} />
      </div>
    </div>
  );
}
