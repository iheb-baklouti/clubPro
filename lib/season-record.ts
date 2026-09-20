export interface SeasonRecordMatch {
  home_or_away: "domicile" | "exterieur";
  score_home: number | null;
  score_away: number | null;
}

export interface SeasonRecord {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export function computeSeasonRecord(matches: SeasonRecordMatch[]): SeasonRecord {
  const record: SeasonRecord = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };

  for (const m of matches) {
    if (m.score_home === null || m.score_away === null) continue;
    const goalsFor = m.home_or_away === "domicile" ? m.score_home : m.score_away;
    const goalsAgainst = m.home_or_away === "domicile" ? m.score_away : m.score_home;

    record.played += 1;
    record.goalsFor += goalsFor;
    record.goalsAgainst += goalsAgainst;
    if (goalsFor > goalsAgainst) record.wins += 1;
    else if (goalsFor === goalsAgainst) record.draws += 1;
    else record.losses += 1;
  }

  return record;
}
