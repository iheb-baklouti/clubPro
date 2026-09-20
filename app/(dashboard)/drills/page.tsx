import Link from "next/link";
import { BookOpen, Boxes } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DrillFormDialog } from "@/components/features/drills/drill-form-dialog";
import { DrillRowActions } from "@/components/features/drills/drill-row-actions";

const CATEGORY_LABEL: Record<string, string> = {
  physique: "Physique",
  technique: "Technique",
  tactique: "Tactique",
};

export default async function DrillsPage() {
  const supabase = await createClient();
  const { data: drills } = await supabase.from("drills").select("*").order("title");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bibliothèque d&apos;exercices</h1>
          <p className="text-muted-foreground">
            Exercices réutilisables pour composer vos séances d&apos;entraînement.
          </p>
        </div>
        <DrillFormDialog mode="create" />
      </div>

      {!drills || drills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <BookOpen className="h-8 w-8" />
            <p>Aucun exercice pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {drills.map((drill) => (
            <Card key={drill.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{drill.title}</p>
                    <Badge variant="outline" className="mt-1">
                      {CATEGORY_LABEL[drill.category]}
                    </Badge>
                  </div>
                  <DrillRowActions drill={drill} />
                </div>
                {drill.description && (
                  <p className="text-sm text-muted-foreground">{drill.description}</p>
                )}
                {drill.diagram_url && (
                  <a
                    href={drill.diagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Voir le schéma (image)
                  </a>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/drills/${drill.id}/schema`}>
                    <Boxes className="h-4 w-4" />
                    {drill.diagram_json ? "Modifier le schéma 3D" : "Créer un schéma 3D"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
