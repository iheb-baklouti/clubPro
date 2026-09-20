import Link from "next/link";
import { Dumbbell } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrainingFormDialog } from "@/components/features/trainings/training-form-dialog";
import { TeamFilterSelect } from "@/components/features/matches/team-filter-select";
import { formatMatchDate } from "@/lib/format";

const TYPE_LABEL: Record<string, string> = {
  physique: "Physique",
  technique: "Technique",
  tactique: "Tactique",
  recuperation: "Récupération",
};

export default async function EntrainementsPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const { team: teamFilter } = await searchParams;
  const supabase = await createClient();

  let trainingsQuery = supabase
    .from("trainings")
    .select("id, date, type, description, teams(id, name)")
    .order("date", { ascending: true });

  if (teamFilter) {
    trainingsQuery = trainingsQuery.eq("team_id", teamFilter);
  }

  const [{ data: teams }, { data: trainings }] = await Promise.all([
    supabase.from("teams").select("id, name").order("name"),
    trainingsQuery,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Entraînements</h1>
          <p className="text-muted-foreground">Planification des séances et présence.</p>
        </div>
        <TrainingFormDialog mode="create" teams={teams ?? []} defaultTeamId={teamFilter} />
      </div>

      <TeamFilterSelect teams={teams ?? []} />

      {!trainings || trainings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <Dumbbell className="h-8 w-8" />
            <p>Aucune séance planifiée pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {trainings.map((training) => (
            <Link key={training.id} href={`/entrainements/${training.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{training.teams?.name}</p>
                      <Badge variant="outline">{TYPE_LABEL[training.type]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatMatchDate(training.date)}
                      {training.description ? ` · ${training.description}` : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
