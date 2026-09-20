import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrainingRowActions } from "@/components/features/trainings/training-row-actions";
import {
  TrainingAvailabilityToggle,
  AttendanceToggle,
} from "@/components/features/trainings/player-training-controls";
import { ExerciseComposer } from "@/components/features/trainings/exercise-composer";
import { formatMatchDate } from "@/lib/format";

const TYPE_LABEL: Record<string, string> = {
  physique: "Physique",
  technique: "Technique",
  tactique: "Tactique",
  recuperation: "Récupération",
};

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ trainingId: string }>;
}) {
  const { trainingId } = await params;
  const supabase = await createClient();

  const { data: training } = await supabase
    .from("trainings")
    .select("*, teams(id, name, club_id)")
    .eq("id", trainingId)
    .single();

  if (!training) notFound();

  const [
    { data: teams },
    { data: players },
    { data: availability },
    { data: attendance },
    { data: drills },
    { data: exercises },
  ] = await Promise.all([
    supabase.from("teams").select("id, name").order("name"),
    supabase
      .from("players")
      .select("id, full_name, jersey_number")
      .eq("team_id", training.team_id)
      .order("jersey_number", { ascending: true, nullsFirst: false }),
    supabase
      .from("availability_responses")
      .select("player_id, status")
      .eq("event_id", trainingId)
      .eq("event_type", "entrainement"),
    supabase.from("training_attendance").select("player_id, present").eq("training_id", trainingId),
    supabase.from("drills").select("id, title, category").order("title"),
    supabase
      .from("training_exercises")
      .select("id, duration_minutes, drills(id, title, category)")
      .eq("training_id", trainingId)
      .order("order_index", { ascending: true }),
  ]);

  const availabilityByPlayer = new Map(availability?.map((a) => [a.player_id, a.status]));
  const attendanceByPlayer = new Map(attendance?.map((a) => [a.player_id, a.present]));

  return (
    <div className="space-y-6">
      <Link href="/entrainements" className="text-sm text-muted-foreground hover:underline">
        &larr; Entraînements
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{training.teams?.name}</h1>
            <Badge variant="outline">{TYPE_LABEL[training.type]}</Badge>
          </div>
          <p className="text-muted-foreground">
            {formatMatchDate(training.date)}
            {training.description ? ` · ${training.description}` : ""}
          </p>
        </div>
        <TrainingRowActions training={training} teams={teams ?? []} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Disponibilité &amp; présence</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!players || players.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">
              Aucun joueur dans cette équipe.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Disponibilité</TableHead>
                  <TableHead>Présence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <span className="font-medium">{player.full_name}</span>
                      {player.jersey_number ? (
                        <span className="ml-1 text-xs text-muted-foreground">
                          #{player.jersey_number}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <TrainingAvailabilityToggle
                        trainingId={trainingId}
                        playerId={player.id}
                        value={availabilityByPlayer.get(player.id) ?? null}
                      />
                    </TableCell>
                    <TableCell>
                      <AttendanceToggle
                        trainingId={trainingId}
                        playerId={player.id}
                        value={attendanceByPlayer.get(player.id) ?? null}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Composition de la séance</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseComposer trainingId={trainingId} drills={drills ?? []} exercises={exercises ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
