import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isFormationData } from "@/lib/formations";
import { TacticalTimeline } from "@/components/features/formations-3d/tactical-timeline";

export default async function TimelinePage({
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

  const [{ data: players }, { data: snapshotRows }, { data: videoClips }] = await Promise.all([
    supabase
      .from("players")
      .select("id, full_name, jersey_number, status")
      .eq("team_id", match.team_id)
      .order("jersey_number", { ascending: true, nullsFirst: false }),
    supabase
      .from("match_tactical_snapshots")
      .select("id, label, timestamp_seconds, order_index, positions_json")
      .eq("match_id", matchId)
      .order("timestamp_seconds", { ascending: true }),
    supabase
      .from("video_clips")
      .select("id, tag_type, timestamp_seconds, description, video_url")
      .eq("match_id", matchId)
      .order("timestamp_seconds", { ascending: true }),
  ]);

  const videoUrl = videoClips?.[0]?.video_url ?? null;

  const snapshots = (snapshotRows ?? [])
    .filter((row) => isFormationData(row.positions_json))
    .map((row) => ({
      id: row.id,
      label: row.label,
      timestampSeconds: row.timestamp_seconds,
      data: row.positions_json as unknown as import("@/lib/formations").FormationData,
    }));

  return (
    <div className="space-y-6">
      <Link
        href={`/calendrier/${matchId}/formation`}
        className="text-sm text-muted-foreground hover:underline"
      >
        &larr; Retour à l&apos;éditeur de formation
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Timeline tactique</h1>
        <p className="text-muted-foreground">
          {match.teams?.name} · vs {match.opponent_name}
        </p>
      </div>

      <TacticalTimeline
        matchId={matchId}
        players={players ?? []}
        snapshots={snapshots}
        videoClips={videoClips ?? []}
        videoUrl={videoUrl}
      />
    </div>
  );
}
