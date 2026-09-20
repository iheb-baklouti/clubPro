import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { buildMatchesIcs } from "@/lib/ical";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase.from("teams").select("id, name").eq("id", teamId).single();

  if (!team) {
    return NextResponse.json({ error: "Équipe introuvable" }, { status: 404 });
  }

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent_name, match_date, location, competition_type, home_or_away")
    .eq("team_id", teamId)
    .order("match_date", { ascending: true });

  const ics = buildMatchesIcs(team.name, matches ?? []);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="clubpro-${team.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics"`,
    },
  });
}
