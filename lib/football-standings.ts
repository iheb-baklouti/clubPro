import "server-only";

export interface StandingRow {
  position: number;
  teamName: string;
  played: number;
  points: number;
  goalDifference: number;
}

/**
 * Classement réel d'un championnat via football-data.org (clé gratuite,
 * quota 10 req/min) — purement informatif, sans lien avec les données du
 * club. Mis en cache 1h côté serveur pour rester largement sous le quota.
 */
export async function getLeagueStandings(competitionCode: string): Promise<StandingRow[] | null> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://api.football-data.org/v4/competitions/${competitionCode}/standings`, {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 60 * 60 },
    });
    if (!res.ok) return null;

    const json = await res.json();
    const table = json?.standings?.find((s: { type?: string }) => s.type === "TOTAL")?.table ?? json?.standings?.[0]?.table;
    if (!Array.isArray(table)) return null;

    return table.slice(0, 6).map(
      (row: {
        position: number;
        team?: { shortName?: string; name?: string };
        playedGames: number;
        points: number;
        goalDifference: number;
      }) => ({
        position: row.position,
        teamName: row.team?.shortName ?? row.team?.name ?? "—",
        played: row.playedGames,
        points: row.points,
        goalDifference: row.goalDifference,
      }),
    );
  } catch {
    return null;
  }
}
