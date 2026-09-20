"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { mutationError } from "@/lib/supabase/mutations";
import {
  matchSchema,
  matchResultSchema,
  playerStatEntrySchema,
  type CallUpStatusValue,
  type AvailabilityStatusValue,
} from "@/lib/validations/matches";
import type { FormationData } from "@/lib/formations";
import type { Json } from "@/lib/types/database.types";

export interface ActionState {
  error?: string;
}

export async function createMatch(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = matchSchema.safeParse({
    teamId: formData.get("teamId"),
    opponentName: formData.get("opponentName"),
    matchDate: formData.get("matchDate"),
    location: formData.get("location"),
    competitionType: formData.get("competitionType"),
    homeOrAway: formData.get("homeOrAway") || "domicile",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("matches").insert({
    team_id: parsed.data.teamId,
    opponent_name: parsed.data.opponentName,
    match_date: parsed.data.matchDate,
    location: parsed.data.location || null,
    competition_type: parsed.data.competitionType || null,
    home_or_away: parsed.data.homeOrAway,
  });

  if (error) return { error: "Impossible de créer le match : " + error.message };

  revalidatePath("/calendrier");
  return {};
}

export async function updateMatch(
  matchId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = matchSchema.safeParse({
    teamId: formData.get("teamId"),
    opponentName: formData.get("opponentName"),
    matchDate: formData.get("matchDate"),
    location: formData.get("location"),
    competitionType: formData.get("competitionType"),
    homeOrAway: formData.get("homeOrAway") || "domicile",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .update({
      team_id: parsed.data.teamId,
      opponent_name: parsed.data.opponentName,
      match_date: parsed.data.matchDate,
      location: parsed.data.location || null,
      competition_type: parsed.data.competitionType || null,
      home_or_away: parsed.data.homeOrAway,
    })
    .eq("id", matchId)
    .select("id");

  const err = mutationError(error, data, "Impossible de modifier le match");
  if (err) return { error: err };

  revalidatePath("/calendrier");
  revalidatePath(`/calendrier/${matchId}`);
  return {};
}

export async function updateMatchResult(
  matchId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = matchResultSchema.safeParse({
    status: formData.get("status"),
    scoreHome: formData.get("scoreHome"),
    scoreAway: formData.get("scoreAway"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .update({
      status: parsed.data.status,
      score_home: parsed.data.scoreHome ? Number(parsed.data.scoreHome) : null,
      score_away: parsed.data.scoreAway ? Number(parsed.data.scoreAway) : null,
    })
    .eq("id", matchId)
    .select("id");

  const err = mutationError(error, data, "Impossible de mettre à jour le match");
  if (err) return { error: err };

  revalidatePath("/calendrier");
  revalidatePath(`/calendrier/${matchId}`);
  return {};
}

export async function deleteMatch(matchId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("matches").delete().eq("id", matchId).select("id");

  const err = mutationError(error, data, "Impossible de supprimer le match");
  if (err) return { error: err };

  revalidatePath("/calendrier");
  return {};
}

export async function setCallUpStatus(
  matchId: string,
  playerId: string,
  status: CallUpStatusValue,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("match_call_ups")
    .upsert({ match_id: matchId, player_id: playerId, status }, { onConflict: "match_id,player_id" })
    .select("id");

  const err = mutationError(error, data, "Impossible d'enregistrer la convocation");
  if (err) return { error: err };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}

export async function setAvailability(
  matchId: string,
  playerId: string,
  status: AvailabilityStatusValue,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_responses")
    .upsert(
      {
        event_id: matchId,
        event_type: "match",
        player_id: playerId,
        status,
        responded_at: new Date().toISOString(),
      },
      { onConflict: "event_id,event_type,player_id" },
    )
    .select("id");

  const err = mutationError(error, data, "Impossible d'enregistrer la disponibilité");
  if (err) return { error: err };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}

export async function upsertPlayerStat(
  matchId: string,
  playerId: string,
  formData: FormData,
): Promise<ActionState> {
  const parsed = playerStatEntrySchema.safeParse({
    playerId,
    goals: formData.get("goals"),
    assists: formData.get("assists"),
    yellowCards: formData.get("yellowCards"),
    redCards: formData.get("redCards"),
    minutesPlayed: formData.get("minutesPlayed"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_stats")
    .upsert(
      {
        match_id: matchId,
        player_id: playerId,
        goals: parsed.data.goals,
        assists: parsed.data.assists,
        yellow_cards: parsed.data.yellowCards,
        red_cards: parsed.data.redCards,
        minutes_played: parsed.data.minutesPlayed,
      },
      { onConflict: "player_id,match_id" },
    )
    .select("id");

  const err = mutationError(error, data, "Impossible d'enregistrer les statistiques");
  if (err) return { error: err };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}

export async function saveFormation(
  matchId: string,
  data: FormationData,
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("formations")
    .upsert(
      {
        match_id: matchId,
        formation_type: data.formationType,
        positions_json: data as unknown as Json,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "match_id" },
    )
    .select("id");

  const err = mutationError(error, rows, "Impossible d'enregistrer la formation");
  if (err) return { error: err };

  revalidatePath(`/calendrier/${matchId}/formation`);
  return {};
}
