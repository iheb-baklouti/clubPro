import Link from "next/link";
import { GitCompare } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { listSequences } from "@/app/(dashboard)/simulations/actions";
import { SequenceListClient } from "@/components/features/formations-3d/sequence-list-client";

export default async function SimulationsPage() {
  const supabase = await createClient();
  const [sequences, { data: teams }] = await Promise.all([
    listSequences(),
    supabase.from("teams").select("id, name").order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulations</h1>
          <p className="text-muted-foreground">
            Scénarios tactiques réutilisables (corner, pressing, sortie de balle...) — une suite
            d&apos;instantanés 3D indépendante d&apos;un match précis.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/simulations/comparer">
            <GitCompare className="h-4 w-4" />
            Comparer des formations
          </Link>
        </Button>
      </div>

      <SequenceListClient sequences={sequences} teams={teams ?? []} />
    </div>
  );
}
