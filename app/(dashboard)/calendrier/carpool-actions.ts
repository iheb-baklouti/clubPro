"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { mutationError } from "@/lib/supabase/mutations";

export interface ActionState {
  error?: string;
}

export async function createCarpoolOffer(
  matchId: string,
  driverPlayerId: string,
  seatsTotal: number,
  departureLocation: string,
  notes: string,
): Promise<ActionState> {
  if (!driverPlayerId) return { error: "Choisissez le conducteur." };

  const supabase = await createClient();
  const { error } = await supabase.from("carpool_offers").insert({
    match_id: matchId,
    driver_player_id: driverPlayerId,
    seats_total: Math.max(1, seatsTotal),
    departure_location: departureLocation || null,
    notes: notes || null,
  });

  if (error) return { error: "Impossible de créer l'offre : " + error.message };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}

export async function deleteCarpoolOffer(offerId: string, matchId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("carpool_offers").delete().eq("id", offerId).select("id");

  const err = mutationError(error, data, "Impossible de supprimer l'offre");
  if (err) return { error: err };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}

export async function joinCarpool(offerId: string, matchId: string, playerId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("carpool_passengers").insert({ offer_id: offerId, player_id: playerId });

  if (error) return { error: "Impossible de rejoindre le covoiturage : " + error.message };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}

export async function leaveCarpool(passengerId: string, matchId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("carpool_passengers")
    .delete()
    .eq("id", passengerId)
    .select("id");

  const err = mutationError(error, data, "Impossible de quitter le covoiturage");
  if (err) return { error: err };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}
