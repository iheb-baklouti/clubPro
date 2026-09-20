import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isFormationData, type FormationData } from "@/lib/formations";
import { SequenceEditor, type SequenceStep } from "@/components/features/formations-3d/sequence-editor";

export default async function SequenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: sequence } = await supabase
    .from("tactical_sequences")
    .select("id, name, notes, team_id, steps_json, teams(name)")
    .eq("id", id)
    .single();

  if (!sequence) notFound();

  const { data: players } = await supabase
    .from("players")
    .select("id, full_name, jersey_number")
    .eq("team_id", sequence.team_id)
    .order("jersey_number", { ascending: true, nullsFirst: false });

  const rawSteps: unknown[] = Array.isArray(sequence.steps_json) ? sequence.steps_json : [];
  const steps: SequenceStep[] = rawSteps
    .map((step) => step as { id: string; label: string; timestampSeconds: number; data: unknown })
    .filter((step): step is { id: string; label: string; timestampSeconds: number; data: FormationData } =>
      isFormationData(step?.data),
    )
    .map((step) => ({
      id: step.id,
      label: step.label,
      timestampSeconds: step.timestampSeconds,
      data: step.data,
    }));

  return (
    <div className="space-y-6">
      <Link href="/simulations" className="text-sm text-muted-foreground hover:underline">
        &larr; Simulations
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{sequence.name}</h1>
        <p className="text-muted-foreground">{sequence.teams?.name}</p>
      </div>

      <SequenceEditor
        sequenceId={sequence.id}
        initialName={sequence.name}
        initialNotes={sequence.notes ?? ""}
        players={players ?? []}
        initialSteps={steps}
      />
    </div>
  );
}
