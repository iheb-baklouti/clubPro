import Link from "next/link";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatMatchDate } from "@/lib/format";
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
        <Link href="/equipes">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle>Équipes</CardTitle>
              <CardDescription>Catégories actives dans le club</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{teamsCount ?? 0}</CardContent>
          </Card>
        </Link>

        <Link href="/equipes">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle>Joueurs</CardTitle>
              <CardDescription>Effectif total du club</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{playersCount ?? 0}</CardContent>
          </Card>
        </Link>

        <Link href="/calendrier">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle>Prochains matchs</CardTitle>
              <CardDescription>Matchs à venir, toutes équipes</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{upcomingMatches ?? 0}</CardContent>
          </Card>
        </Link>

        <Link href="/cotisations">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle>Cotisations en attente</CardTitle>
              <CardDescription>Paiements non réglés</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{pendingPayments ?? 0}</CardContent>
          </Card>
        </Link>

        <Link href="/taches">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader>
              <CardTitle>Tâches à faire</CardTitle>
              <CardDescription>Assignations bénévoles en cours</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{openTasks ?? 0}</CardContent>
          </Card>
        </Link>
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
