import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { isFormationData, type FormationData } from "@/lib/formations";
import { FormationComparer, type ComparableFormation } from "@/components/features/formations-3d/formation-comparer";

export default async function CompareFormationsPage() {
  const supabase = await createClient();

  const [{ data: templates }, { data: matchFormations }, { data: players }] = await Promise.all([
    supabase
      .from("formation_templates")
      .select("id, name, positions_json, teams(name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("formations")
      .select("id, positions_json, matches(opponent_name, match_date, teams(name))")
      .order("created_at", { ascending: false }),
    supabase.from("players").select("id, full_name, jersey_number"),
  ]);

  const options: ComparableFormation[] = [
    ...(templates ?? [])
      .filter((t) => isFormationData(t.positions_json))
      .map((t) => ({
        id: `template:${t.id}`,
        label: `Modèle · ${t.name} (${t.teams?.name ?? "Club"})`,
        data: t.positions_json as unknown as FormationData,
      })),
    ...(matchFormations ?? [])
      .filter((f) => isFormationData(f.positions_json))
      .map((f) => ({
        id: `match:${f.id}`,
        label: `Match · ${f.matches?.teams?.name ?? ""} vs ${f.matches?.opponent_name ?? "?"}`,
        data: f.positions_json as unknown as FormationData,
      })),
  ];

  return (
    <div className="space-y-6">
      <Link href="/simulations" className="text-sm text-muted-foreground hover:underline">
        &larr; Simulations
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comparaison de formations</h1>
        <p className="text-muted-foreground">
          Comparez côte à côte deux formations sauvegardées (modèles ou matchs) pour analyser
          l&apos;occupation de l&apos;espace.
        </p>
      </div>

      <FormationComparer options={options} players={players ?? []} />
    </div>
  );
}
