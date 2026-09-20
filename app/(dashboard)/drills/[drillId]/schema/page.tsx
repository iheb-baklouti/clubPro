import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isFormationData, type FormationData } from "@/lib/formations";
import { DrillDiagramEditor } from "@/components/features/drills/drill-diagram-editor";

export default async function DrillSchemaPage({
  params,
}: {
  params: Promise<{ drillId: string }>;
}) {
  const { drillId } = await params;
  const supabase = await createClient();

  const { data: drill } = await supabase
    .from("drills")
    .select("id, title, diagram_json")
    .eq("id", drillId)
    .single();

  if (!drill) notFound();

  const initialData: FormationData | null = isFormationData(drill.diagram_json)
    ? (drill.diagram_json as unknown as FormationData)
    : null;

  return (
    <div className="space-y-6">
      <Link href="/drills" className="text-sm text-muted-foreground hover:underline">
        &larr; Exercices
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Schéma — {drill.title}</h1>
        <p className="text-muted-foreground">
          Placez des plots, joueurs et flèches de mouvement pour illustrer cet exercice.
        </p>
      </div>

      <DrillDiagramEditor drillId={drillId} initialData={initialData} />
    </div>
  );
}
