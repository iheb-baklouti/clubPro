export interface PlayerStatRow {
  goals: number;
  assists: number;
  minutes_played: number;
  yellow_cards: number;
  red_cards: number;
}

export interface PlayerTotals {
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
}

export interface RadarMetric {
  metric: string;
  value: number;
  raw: string;
}

export function sumPlayerStats(stats: PlayerStatRow[]): PlayerTotals {
  return stats.reduce(
    (acc, s) => ({
      matches: acc.matches + 1,
      goals: acc.goals + s.goals,
      assists: acc.assists + s.assists,
      yellowCards: acc.yellowCards + s.yellow_cards,
      redCards: acc.redCards + s.red_cards,
      minutesPlayed: acc.minutesPlayed + s.minutes_played,
    }),
    { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: 0 },
  );
}

const clampPercent = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

/**
 * Construit les données du radar de performance, chaque axe étant relatif au
 * maximum de l'équipe (percentile simplifié, pas de comparaison inter-clubs).
 */
export function buildRadarData(
  totals: PlayerTotals,
  teamStatsByPlayer: Map<
    string,
    { goals: number; assists: number; minutes: number; discipline: number; matches: number }
  >,
): RadarMetric[] {
  const values = Array.from(teamStatsByPlayer.values());
  const teamMax = {
    goals: Math.max(1, ...values.map((t) => t.goals)),
    assists: Math.max(1, ...values.map((t) => t.assists)),
    minutes: Math.max(1, ...values.map((t) => t.minutes)),
    matches: Math.max(1, ...values.map((t) => t.matches)),
    discipline: Math.max(1, ...values.map((t) => t.discipline)),
  };

  const playerDiscipline = totals.yellowCards * 15 + totals.redCards * 35;

  return [
    {
      metric: "Buts",
      value: clampPercent((totals.goals / teamMax.goals) * 100),
      raw: String(totals.goals),
    },
    {
      metric: "Passes D.",
      value: clampPercent((totals.assists / teamMax.assists) * 100),
      raw: String(totals.assists),
    },
    {
      metric: "Minutes",
      value: clampPercent((totals.minutesPlayed / teamMax.minutes) * 100),
      raw: `${totals.minutesPlayed} min`,
    },
    {
      metric: "Présence",
      value: clampPercent((totals.matches / teamMax.matches) * 100),
      raw: `${totals.matches} match(s)`,
    },
    {
      metric: "Discipline",
      value: clampPercent(100 - (playerDiscipline / teamMax.discipline) * 100),
      raw: `${totals.yellowCards} CJ · ${totals.redCards} CR`,
    },
  ];
}

export interface ProgressionPoint {
  matchLabel: string;
  matchDate: string;
  cumulativeGoals: number;
  cumulativeAssists: number;
}

/**
 * Série chronologique cumulée buts/passes décisives — nécessite les stats
 * triées de la plus ancienne à la plus récente (inverse de l'ordre habituel
 * "activité récente d'abord" utilisé ailleurs sur la fiche joueur).
 */
export function buildProgressionData(
  stats: (PlayerStatRow & { matches: { opponent_name: string; match_date: string } | null })[],
): ProgressionPoint[] {
  const sorted = [...stats].sort(
    (a, b) => new Date(a.matches?.match_date ?? 0).getTime() - new Date(b.matches?.match_date ?? 0).getTime(),
  );

  let cumulativeGoals = 0;
  let cumulativeAssists = 0;

  return sorted.map((stat) => {
    cumulativeGoals += stat.goals;
    cumulativeAssists += stat.assists;
    return {
      matchLabel: stat.matches?.opponent_name ?? "?",
      matchDate: stat.matches?.match_date ?? "",
      cumulativeGoals,
      cumulativeAssists,
    };
  });
}

export function buildTeamStatsByPlayer(
  rows: { player_id: string; goals: number; assists: number; minutes_played: number; yellow_cards: number; red_cards: number }[],
) {
  const map = new Map<
    string,
    { goals: number; assists: number; minutes: number; discipline: number; matches: number }
  >();
  for (const row of rows) {
    const current = map.get(row.player_id) ?? {
      goals: 0,
      assists: 0,
      minutes: 0,
      discipline: 0,
      matches: 0,
    };
    current.goals += row.goals;
    current.assists += row.assists;
    current.minutes += row.minutes_played;
    current.discipline += row.yellow_cards * 15 + row.red_cards * 35;
    current.matches += 1;
    map.set(row.player_id, current);
  }
  return map;
}
