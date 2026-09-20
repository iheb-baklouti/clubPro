import Link from "next/link";
import { notFound } from "next/navigation";
import { History } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FormationEditor3D } from "@/components/features/formations-3d/formation-editor-3d";
import { isFormationData, type FormationData } from "@/lib/formations";

export default async function FormationPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("id, opponent_name, team_id, teams(name)")
    .eq("id", matchId)
    .single();

  if (!match) notFound();

  const [{ data: players }, { data: formationRow }, { data: teamMatches }] = await Promise.all([
    supabase
      .from("players")
      .select("id, full_name, jersey_number, status")
      .eq("team_id", match.team_id)
      .order("jersey_number", { ascending: true, nullsFirst: false }),
    supabase.from("formations").select("positions_json").eq("match_id", matchId).maybeSingle(),
    supabase
      .from("matches")
      .select("id, home_or_away, score_home, score_away, formations(formation_type)")
      .eq("team_id", match.team_id)
      .eq("status", "joue"),
  ]);

  const initialData: FormationData | null = isFormationData(formationRow?.positions_json)
    ? formationRow.positions_json
    : null;

  const winCounts = new Map<string, number>();
  for (const m of teamMatches ?? []) {
    const won =
      m.home_or_away === "domicile"
        ? (m.score_home ?? 0) > (m.score_away ?? 0)
        : (m.score_away ?? 0) > (m.score_home ?? 0);
    const formationType = m.formations?.formation_type;
    if (won && formationType) {
      winCounts.set(formationType, (winCounts.get(formationType) ?? 0) + 1);
    }
  }
  let suggestedFormationType: string | null = null;
  let bestCount = 0;
  for (const [type, count] of winCounts) {
    if (count > bestCount) {
      bestCount = count;
      suggestedFormationType = type;
    }
  }

  return (
    <div className="space-y-6">
      <Link href={`/calendrier/${matchId}`} className="text-sm text-muted-foreground hover:underline">
        &larr; vs {match.opponent_name}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Éditeur de formation 3D</h1>
          <p className="text-muted-foreground">{match.teams?.name} · vs {match.opponent_name}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/calendrier/${matchId}/timeline`}>
            <History className="h-4 w-4" />
            Timeline tactique
          </Link>
        </Button>
      </div>

      <FormationEditor3D
        matchId={matchId}
        players={players ?? []}
        initialData={initialData}
        suggestedFormationType={suggestedFormationType}
      />
    </div>
  );
}
