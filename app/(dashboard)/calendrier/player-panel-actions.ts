"use server";

import { createClient } from "@/lib/supabase/server";
import { sumPlayerStats, buildRadarData, buildTeamStatsByPlayer, type RadarMetric } from "@/lib/player-stats";

export interface PlayerPanelData {
  player: {
    id: string;
    full_name: string;
    jersey_number: number | null;
    position: string | null;
    status: "actif" | "blesse" | "suspendu";
  };
  totals: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
  };
  radarData: RadarMetric[];
}

export async function getPlayerPanelData(playerId: string): Promise<PlayerPanelData | null> {
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("players")
    .select("id, full_name, jersey_number, position, status, team_id")
    .eq("id", playerId)
    .single();

  if (!player) return null;

  const [{ data: stats }, { data: teamStats }] = await Promise.all([
    supabase.from("player_stats").select("*").eq("player_id", playerId),
    supabase
      .from("player_stats")
      .select("player_id, goals, assists, minutes_played, yellow_cards, red_cards, players!inner(team_id)")
      .eq("players.team_id", player.team_id),
  ]);

  const totals = sumPlayerStats(stats ?? []);
  const teamStatsByPlayer = buildTeamStatsByPlayer(teamStats ?? []);
  const radarData = buildRadarData(totals, teamStatsByPlayer);

  return {
    player: {
      id: player.id,
      full_name: player.full_name,
      jersey_number: player.jersey_number,
      position: player.position,
      status: player.status,
    },
    totals,
    radarData,
  };
}
