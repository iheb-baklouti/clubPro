import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { TeamFormDialog } from "@/components/features/teams/team-form-dialog";

export default async function EquipesPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, category, players(count)")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Équipes</h1>
          <p className="text-muted-foreground">Gérez les catégories et effectifs du club.</p>
        </div>
        <TeamFormDialog mode="create" />
      </div>

      {!teams || teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <Users className="h-8 w-8" />
            <p>Aucune équipe pour le moment. Créez votre première équipe pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/equipes/${team.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-sm text-muted-foreground">{team.category}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {team.players[0]?.count ?? 0} joueur(s)
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
