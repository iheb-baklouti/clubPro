import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlayerFormDialog } from "@/components/features/players/player-form-dialog";
import { PlayerRadarChart } from "@/components/features/players/player-radar-chart";
import { PlayerProgressionChart } from "@/components/features/players/player-progression-chart";
import { PlayerAvatar } from "@/components/features/players/player-avatar";
import { ExportCsvButton } from "@/components/features/shared/export-csv-button";
import { ExportPlayerPdfButton } from "@/components/features/players/export-player-pdf-button";
import { formatMatchDate } from "@/lib/format";
import {
  sumPlayerStats,
  buildRadarData,
  buildTeamStatsByPlayer,
  buildProgressionData,
} from "@/lib/player-stats";

const STATUS_VARIANT = {
  actif: "default",
  blesse: "destructive",
  suspendu: "secondary",
} as const;

const STATUS_LABEL = {
  actif: "Actif",
  blesse: "Blessé",
  suspendu: "Suspendu",
} as const;

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ teamId: string; playerId: string }>;
}) {
  const { teamId, playerId } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select("*, teams(id, name)")
    .eq("id", playerId)
    .eq("team_id", teamId)
    .single();

  if (!player) notFound();

  const [{ data: stats }, { data: teamStats }] = await Promise.all([
    supabase
      .from("player_stats")
      .select("*, matches(opponent_name, match_date)")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("player_stats")
      .select("player_id, goals, assists, minutes_played, yellow_cards, red_cards, players!inner(team_id)")
      .eq("players.team_id", teamId),
  ]);

  const totals = sumPlayerStats(stats ?? []);
  const teamStatsByPlayer = buildTeamStatsByPlayer(teamStats ?? []);
  const radarData = buildRadarData(totals, teamStatsByPlayer);
  const progressionData = buildProgressionData(stats ?? []);
  const statRows = (stats ?? []).map((s) => ({
    match: s.matches ? `vs ${s.matches.opponent_name} (${formatMatchDate(s.matches.match_date)})` : "?",
    goals: s.goals,
    assists: s.assists,
    yellow_cards: s.yellow_cards,
    red_cards: s.red_cards,
    minutes_played: s.minutes_played,
  }));

  return (
    <div className="space-y-6">
      <Link href={`/equipes/${teamId}`} className="text-sm text-muted-foreground hover:underline">
        &larr; {player.teams?.name ?? "Équipe"}
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <PlayerAvatar
            playerId={player.id}
            fullName={player.full_name}
            photoUrl={player.photo_url}
            className="h-16 w-16 text-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{player.full_name}</h1>
              <Badge variant={STATUS_VARIANT[player.status]}>{STATUS_LABEL[player.status]}</Badge>
            </div>
            <p className="text-muted-foreground">
              {player.position ?? "Poste non renseigné"}
              {player.jersey_number ? ` · N°${player.jersey_number}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportPlayerPdfButton
            data={{
              fullName: player.full_name,
              position: player.position,
              jerseyNumber: player.jersey_number,
              totals: {
                matches: totals.matches,
                goals: totals.goals,
                assists: totals.assists,
                yellowCards: totals.yellowCards,
                redCards: totals.redCards,
                minutesPlayed: totals.minutesPlayed,
              },
              matchRows: statRows,
            }}
          />
          <PlayerFormDialog mode="edit" teamId={teamId} player={player} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Matchs", value: totals.matches },
          { label: "Buts", value: totals.goals },
          { label: "Passes D.", value: totals.assists },
          { label: "Cartons jaunes", value: totals.yellowCards },
          { label: "Cartons rouges", value: totals.redCards },
          { label: "Minutes", value: totals.minutesPlayed },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {totals.matches > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Radar de performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Chaque axe est relatif au meilleur de l&apos;équipe sur cette saison.
            </p>
          </CardHeader>
          <CardContent>
            <PlayerRadarChart data={radarData} />
          </CardContent>
        </Card>
      )}

      {progressionData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progression sur la saison</CardTitle>
            <p className="text-sm text-muted-foreground">
              Buts et passes décisives cumulés match après match.
            </p>
          </CardHeader>
          <CardContent>
            <PlayerProgressionChart data={progressionData} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Statistiques par match</CardTitle>
          <ExportCsvButton
            rows={statRows}
            filename={`stats-${player.full_name}`}
            columns={[
              { key: "match", label: "Match" },
              { key: "goals", label: "Buts" },
              { key: "assists", label: "Passes D." },
              { key: "yellow_cards", label: "Cartons jaunes" },
              { key: "red_cards", label: "Cartons rouges" },
              { key: "minutes_played", label: "Minutes" },
            ]}
          />
        </CardHeader>
        <CardContent className="p-0">
          {!stats || stats.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">
              Aucune statistique enregistrée pour le moment.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Buts</TableHead>
                  <TableHead>Passes D.</TableHead>
                  <TableHead>CJ</TableHead>
                  <TableHead>CR</TableHead>
                  <TableHead>Minutes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div>vs {s.matches?.opponent_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.matches ? formatMatchDate(s.matches.match_date) : ""}
                      </div>
                    </TableCell>
                    <TableCell>{s.goals}</TableCell>
                    <TableCell>{s.assists}</TableCell>
                    <TableCell>{s.yellow_cards}</TableCell>
                    <TableCell>{s.red_cards}</TableCell>
                    <TableCell>{s.minutes_played}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
