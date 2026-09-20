import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLeagueStandings } from "@/lib/football-standings";

export async function LeagueStandingsCard({ competitionCode = "PL", competitionName = "Premier League" }: {
  competitionCode?: string;
  competitionName?: string;
}) {
  const table = await getLeagueStandings(competitionCode);
  if (!table || table.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{competitionName} — Classement</CardTitle>
        <CardDescription>Données réelles, à titre informatif (football-data.org)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {table.map((row) => (
          <div
            key={row.position}
            className="flex items-center justify-between gap-3 border-b px-6 py-2 text-sm last:border-0"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="w-5 text-muted-foreground">{row.position}</span>
              <span className="truncate font-medium">{row.teamName}</span>
            </div>
            <div className="flex items-center gap-3 tabular-nums text-muted-foreground">
              <span>{row.played} J</span>
              <span className="font-semibold text-foreground">{row.points} pts</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LeagueStandingsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}
