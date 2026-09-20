import Link from "next/link";
import { CalendarDays, Download } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchFormDialog } from "@/components/features/matches/match-form-dialog";
import { TeamFilterSelect } from "@/components/features/matches/team-filter-select";
import { ExportCsvButton } from "@/components/features/shared/export-csv-button";
import { formatMatchDate } from "@/lib/format";

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const { team: teamFilter } = await searchParams;
  const supabase = await createClient();

  let matchesQuery = supabase
    .from("matches")
    .select("id, opponent_name, match_date, location, home_or_away, status, score_home, score_away, teams(id, name)")
    .order("match_date", { ascending: true });

  if (teamFilter) {
    matchesQuery = matchesQuery.eq("team_id", teamFilter);
  }

  const [{ data: teams }, { data: matches }] = await Promise.all([
    supabase.from("teams").select("id, name").order("name"),
    matchesQuery,
  ]);

  const matchRows = (matches ?? []).map((m) => ({
    team: m.teams?.name ?? "",
    opponent: m.opponent_name,
    date: formatMatchDate(m.match_date),
    lieu: m.location ?? "",
    domicile_exterieur: m.home_or_away,
    statut: m.status === "joue" ? "Joué" : "À venir",
    score: m.status === "joue" ? `${m.score_home ?? "–"} : ${m.score_away ?? "–"}` : "",
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendrier</h1>
          <p className="text-muted-foreground">Matchs à venir et joués.</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCsvButton
            rows={matchRows}
            filename="matchs"
            columns={[
              { key: "team", label: "Équipe" },
              { key: "opponent", label: "Adversaire" },
              { key: "date", label: "Date" },
              { key: "lieu", label: "Lieu" },
              { key: "domicile_exterieur", label: "Domicile/Extérieur" },
              { key: "statut", label: "Statut" },
              { key: "score", label: "Score" },
            ]}
          />
          {teamFilter && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/calendrier/export/${teamFilter}`} download>
                <Download className="h-4 w-4" />
                Exporter (.ics)
              </a>
            </Button>
          )}
          <MatchFormDialog mode="create" teams={teams ?? []} defaultTeamId={teamFilter} />
        </div>
      </div>

      <TeamFilterSelect teams={teams ?? []} />

      {!matches || matches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <CalendarDays className="h-8 w-8" />
            <p>Aucun match planifié pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {matches.map((match) => (
            <Link key={match.id} href={`/calendrier/${match.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {match.home_or_away === "domicile" ? "vs" : "@"} {match.opponent_name}
                      </p>
                      <Badge variant={match.status === "joue" ? "secondary" : "outline"}>
                        {match.status === "joue" ? "Joué" : "À venir"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {match.teams?.name} · {formatMatchDate(match.match_date)}
                      {match.location ? ` · ${match.location}` : ""}
                    </p>
                  </div>
                  {match.status === "joue" && (
                    <p className="text-lg font-bold tabular-nums">
                      {match.score_home ?? "–"} : {match.score_away ?? "–"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
