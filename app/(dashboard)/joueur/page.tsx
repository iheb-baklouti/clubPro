import { redirect } from "next/navigation";
import { CalendarDays, ClipboardList, Wallet } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayerContext } from "@/lib/supabase/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/features/players/player-avatar";
import { StatCard } from "@/components/features/dashboard/stat-card";
import { formatMatchDate } from "@/lib/format";

export default async function JoueurDashboardPage() {
  const ctx = await getCurrentPlayerContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const [{ data: player }, { data: upcomingMatches }, { data: openTasks }, { count: pendingPayments }] =
    await Promise.all([
      supabase
        .from("players")
        .select("full_name, position, jersey_number, status, photo_url, teams(name)")
        .eq("id", ctx.playerId)
        .single(),
      supabase
        .from("matches")
        .select("id, opponent_name, match_date, home_or_away, location")
        .eq("team_id", ctx.teamId)
        .eq("status", "a_venir")
        .order("match_date", { ascending: true })
        .limit(3),
      supabase
        .from("tasks")
        .select("id, title, due_date")
        .eq("assigned_player_id", ctx.playerId)
        .eq("status", "a_faire")
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("player_id", ctx.playerId)
        .eq("status", "en_attente"),
    ]);

  if (!player) redirect("/login");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <PlayerAvatar
          playerId={ctx.playerId}
          fullName={player.full_name}
          photoUrl={player.photo_url}
          className="h-16 w-16 text-lg"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Salut {player.full_name.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground">
            {player.teams?.name} · {player.position ?? "Poste non renseigné"}
            {player.jersey_number ? ` · N°${player.jersey_number}` : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          href="/joueur/calendrier"
          icon={CalendarDays}
          label="Prochains matchs"
          value={upcomingMatches?.length ?? 0}
          accent="live"
        />
        <StatCard
          href="/joueur/taches"
          icon={ClipboardList}
          label="Tâches à faire"
          value={openTasks?.length ?? 0}
        />
        <StatCard
          href="/joueur/cotisations"
          icon={Wallet}
          label="Cotisations en attente"
          value={pendingPayments ?? 0}
          accent="gold"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prochains matchs</CardTitle>
          <CardDescription>{player.teams?.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 p-0">
          {!upcomingMatches || upcomingMatches.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">Aucun match à venir pour le moment.</p>
          ) : (
            upcomingMatches.map((match) => (
              <div key={match.id} className="flex items-center justify-between gap-3 border-b px-6 py-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">
                    {match.home_or_away === "domicile" ? "vs" : "@"} {match.opponent_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatMatchDate(match.match_date)}
                    {match.location ? ` · ${match.location}` : ""}
                  </p>
                </div>
                <Badge variant="outline">À venir</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
