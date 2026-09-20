import Link from "next/link";
import { Suspense } from "react";
import { Users, UsersRound, CalendarDays, Wallet, ClipboardList } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatMatchDate } from "@/lib/format";
import { StatCard } from "@/components/features/dashboard/stat-card";
import {
  LeagueStandingsCard,
  LeagueStandingsCardSkeleton,
} from "@/components/features/dashboard/league-standings-card";

export default async function DirectionDashboardPage() {
  const supabase = await createClient();
  const [
    { count: teamsCount },
    { count: playersCount },
    { count: upcomingMatches },
    { count: pendingPayments },
    { count: openTasks },
    { data: recentMatches },
  ] = await Promise.all([
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("matches").select("id", { count: "exact", head: true }).eq("status", "a_venir"),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "en_attente"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("status", "a_faire"),
    supabase
      .from("matches")
      .select("id, opponent_name, match_date, status, score_home, score_away, home_or_away, teams(name)")
      .order("match_date", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord — Direction</h1>
        <p className="text-muted-foreground">Vue globale du club.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard href="/equipes" icon={Users} label="Équipes actives" value={teamsCount ?? 0} />
        <StatCard href="/equipes" icon={UsersRound} label="Joueurs au total" value={playersCount ?? 0} />
        <StatCard
          href="/calendrier"
          icon={CalendarDays}
          label="Matchs à venir"
          value={upcomingMatches ?? 0}
          accent="live"
        />
        <StatCard
          href="/cotisations"
          icon={Wallet}
          label="Cotisations en attente"
          value={pendingPayments ?? 0}
          accent="gold"
        />
        <StatCard href="/taches" icon={ClipboardList} label="Tâches à faire" value={openTasks ?? 0} />
      </div>

      <Suspense fallback={<LeagueStandingsCardSkeleton />}>
        <LeagueStandingsCard />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activité récente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          {!recentMatches || recentMatches.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">Aucun match pour le moment.</p>
          ) : (
            recentMatches.map((match) => (
              <Link
                key={match.id}
                href={`/calendrier/${match.id}`}
                className="flex items-center justify-between gap-3 border-b px-6 py-3 last:border-0 hover:bg-accent/50"
              >
                <div>
                  <p className="text-sm font-medium">
                    {match.teams?.name} {match.home_or_away === "domicile" ? "vs" : "@"}{" "}
                    {match.opponent_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatMatchDate(match.match_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {match.status === "joue" && (
                    <span className="text-sm font-semibold tabular-nums">
                      {match.score_home ?? "–"} : {match.score_away ?? "–"}
                    </span>
                  )}
                  <Badge variant={match.status === "joue" ? "secondary" : "outline"}>
                    {match.status === "joue" ? "Joué" : "À venir"}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
