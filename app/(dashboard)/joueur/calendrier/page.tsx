import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayerContext } from "@/lib/supabase/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvailabilityToggle } from "@/components/features/matches/player-match-controls";
import { TrainingAvailabilityToggle } from "@/components/features/trainings/player-training-controls";
import { formatMatchDate } from "@/lib/format";

const TRAINING_TYPE_LABEL: Record<string, string> = {
  physique: "Physique",
  technique: "Technique",
  tactique: "Tactique",
  recuperation: "Récupération",
};

export default async function JoueurCalendrierPage() {
  const ctx = await getCurrentPlayerContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const [{ data: matches }, { data: trainings }, { data: matchAvailability }, { data: trainingAvailability }] =
    await Promise.all([
      supabase
        .from("matches")
        .select("id, opponent_name, match_date, home_or_away, location, status, score_home, score_away")
        .eq("team_id", ctx.teamId)
        .order("match_date", { ascending: true }),
      supabase
        .from("trainings")
        .select("id, date, type, description")
        .eq("team_id", ctx.teamId)
        .order("date", { ascending: true }),
      supabase
        .from("availability_responses")
        .select("event_id, status")
        .eq("player_id", ctx.playerId)
        .eq("event_type", "match"),
      supabase
        .from("availability_responses")
        .select("event_id, status")
        .eq("player_id", ctx.playerId)
        .eq("event_type", "entrainement"),
    ]);

  const matchAvailabilityByEvent = new Map(matchAvailability?.map((a) => [a.event_id, a.status]));
  const trainingAvailabilityByEvent = new Map(trainingAvailability?.map((a) => [a.event_id, a.status]));

  const events = [
    ...(matches ?? []).map((m) => ({ kind: "match" as const, date: m.match_date, data: m })),
    ...(trainings ?? []).map((t) => ({ kind: "training" as const, date: t.date, data: t })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendrier</h1>
        <p className="text-muted-foreground">Matchs et entraînements de ton équipe — indique ta disponibilité.</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <CalendarDays className="h-8 w-8" />
            <p>Rien de prévu pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {events.map((event) =>
            event.kind === "match" ? (
              <Card key={`match-${event.data.id}`}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {event.data.home_or_away === "domicile" ? "vs" : "@"} {event.data.opponent_name}
                      </p>
                      <Badge variant={event.data.status === "joue" ? "secondary" : "outline"}>
                        {event.data.status === "joue" ? "Joué" : "À venir"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatMatchDate(event.data.match_date)}
                      {event.data.location ? ` · ${event.data.location}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {event.data.status === "joue" ? (
                      <p className="text-lg font-bold tabular-nums">
                        {event.data.score_home ?? "–"} : {event.data.score_away ?? "–"}
                      </p>
                    ) : (
                      <AvailabilityToggle
                        matchId={event.data.id}
                        playerId={ctx.playerId}
                        value={matchAvailabilityByEvent.get(event.data.id) ?? null}
                      />
                    )}
                    <Link
                      href={`/calendrier/${event.data.id}`}
                      aria-label="Voir la fiche du match"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={`training-${event.data.id}`}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Entraînement</p>
                      <Badge variant="outline">{TRAINING_TYPE_LABEL[event.data.type] ?? event.data.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatMatchDate(event.data.date)}
                      {event.data.description ? ` · ${event.data.description}` : ""}
                    </p>
                  </div>
                  <TrainingAvailabilityToggle
                    trainingId={event.data.id}
                    playerId={ctx.playerId}
                    value={trainingAvailabilityByEvent.get(event.data.id) ?? null}
                  />
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
