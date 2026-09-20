import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutTemplate } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/lib/supabase/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MatchRowActions } from "@/components/features/matches/match-row-actions";
import { MatchResultForm } from "@/components/features/matches/match-result-form";
import { AvailabilityToggle, CallUpToggle } from "@/components/features/matches/player-match-controls";
import { PlayerStatsRowForm } from "@/components/features/matches/player-stats-row-form";
import { MatchVideoSection } from "@/components/features/matches/match-video-section";
import { MatchWeatherCard } from "@/components/features/matches/match-weather-card";
import { ScoutingNotesForm } from "@/components/features/matches/scouting-notes-form";
import { ExportMatchPdfButton } from "@/components/features/matches/export-match-pdf-button";
import { MvpVoting } from "@/components/features/matches/mvp-voting";
import { MatchPhotoGallery } from "@/components/features/matches/match-photo-gallery";
import { CarpoolBoard } from "@/components/features/matches/carpool-board";
import { formatMatchDate } from "@/lib/format";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("*, teams(id, name, club_id)")
    .eq("id", matchId)
    .single();

  if (!match) notFound();

  const [
    { data: teams },
    { data: players },
    { data: callUps },
    { data: availability },
    { data: stats },
    { data: videoClips },
    { data: scoutingNote },
    { data: mvpVotes },
    { data: photos },
    { data: carpoolOffers },
    session,
  ] = await Promise.all([
    supabase.from("teams").select("id, name").order("name"),
    supabase
      .from("players")
      .select("id, full_name, jersey_number, status")
      .eq("team_id", match.team_id)
      .order("jersey_number", { ascending: true, nullsFirst: false }),
    supabase.from("match_call_ups").select("player_id, status").eq("match_id", matchId),
    supabase
      .from("availability_responses")
      .select("player_id, status")
      .eq("event_id", matchId)
      .eq("event_type", "match"),
    supabase.from("player_stats").select("*").eq("match_id", matchId),
    supabase
      .from("video_clips")
      .select("id, video_url, timestamp_seconds, tag_type, description")
      .eq("match_id", matchId)
      .order("timestamp_seconds", { ascending: true }),
    supabase
      .from("match_scouting_notes")
      .select("strengths, weaknesses, key_players, notes")
      .eq("match_id", matchId)
      .maybeSingle(),
    supabase.from("match_mvp_votes").select("voter_profile_id, voted_player_id").eq("match_id", matchId),
    supabase
      .from("match_photos")
      .select("id, storage_path, caption, created_at")
      .eq("match_id", matchId)
      .order("created_at", { ascending: false }),
    supabase
      .from("carpool_offers")
      .select("id, driver_player_id, seats_total, departure_location, notes, players(full_name)")
      .eq("match_id", matchId),
    getCurrentSession(),
  ]);

  const callUpByPlayer = new Map(callUps?.map((c) => [c.player_id, c.status]));
  const availabilityByPlayer = new Map(availability?.map((a) => [a.player_id, a.status]));
  const statByPlayer = new Map(stats?.map((s) => [s.player_id, s]));
  const mvpTally = new Map<string, number>();
  for (const v of mvpVotes ?? []) mvpTally.set(v.voted_player_id, (mvpTally.get(v.voted_player_id) ?? 0) + 1);
  const myMvpVote = mvpVotes?.find((v) => v.voter_profile_id === session?.userId)?.voted_player_id ?? null;

  const offerIds = (carpoolOffers ?? []).map((o) => o.id);
  const { data: passengers } = offerIds.length
    ? await supabase
        .from("carpool_passengers")
        .select("id, offer_id, player_id, players(full_name)")
        .in("offer_id", offerIds)
    : { data: [] };

  return (
    <div className="space-y-6">
      <Link href="/calendrier" className="text-sm text-muted-foreground hover:underline">
        &larr; Calendrier
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {match.home_or_away === "domicile" ? "vs" : "@"} {match.opponent_name}
            </h1>
            <Badge variant={match.status === "joue" ? "secondary" : "outline"}>
              {match.status === "joue" ? "Joué" : "À venir"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {match.teams?.name} · {formatMatchDate(match.match_date)}
            {match.location ? ` · ${match.location}` : ""}
            {match.competition_type ? ` · ${match.competition_type}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMatchPdfButton
            data={{
              teamName: match.teams?.name ?? "",
              opponentName: match.opponent_name,
              homeOrAway: match.home_or_away,
              dateLabel: formatMatchDate(match.match_date),
              location: match.location,
              competitionType: match.competition_type,
              status: match.status,
              scoreHome: match.score_home,
              scoreAway: match.score_away,
              players: players ?? [],
              callUps: callUps ?? [],
              stats: stats ?? [],
            }}
          />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/calendrier/${matchId}/formation`}>
              <LayoutTemplate className="h-4 w-4" />
              Formation
            </Link>
          </Button>
          <MatchRowActions match={match} teams={teams ?? []} />
        </div>
      </div>

      {match.status === "a_venir" && (
        <MatchWeatherCard location={match.location} matchDate={match.match_date} />
      )}

      {match.status === "a_venir" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes de scouting</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoutingNotesForm matchId={matchId} initial={scoutingNote ?? null} />
          </CardContent>
        </Card>
      )}

      {match.status === "a_venir" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Covoiturage</CardTitle>
          </CardHeader>
          <CardContent>
            <CarpoolBoard
              matchId={matchId}
              players={players ?? []}
              currentPlayerId={session?.playerId ?? null}
              canManageAll={!session?.playerId}
              offers={(carpoolOffers ?? []).map((o) => ({
                id: o.id,
                driverPlayerId: o.driver_player_id,
                driverName: o.players?.full_name ?? "?",
                seatsTotal: o.seats_total,
                departureLocation: o.departure_location,
                notes: o.notes,
                passengers: (passengers ?? [])
                  .filter((p) => p.offer_id === o.id)
                  .map((p) => ({ id: p.id, playerId: p.player_id, name: p.players?.full_name ?? "?" })),
              }))}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Résultat</CardTitle>
        </CardHeader>
        <CardContent>
          <MatchResultForm match={match} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Convocations &amp; disponibilité</CardTitle>
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
                  <TableHead>Convocation</TableHead>
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
                      <AvailabilityToggle
                        matchId={matchId}
                        playerId={player.id}
                        value={availabilityByPlayer.get(player.id) ?? null}
                      />
                    </TableCell>
                    <TableCell>
                      <CallUpToggle
                        matchId={matchId}
                        playerId={player.id}
                        value={callUpByPlayer.get(player.id) ?? null}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {match.status === "joue" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistiques des joueurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!players || players.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucun joueur dans cette équipe.</p>
            ) : (
              players.map((player) => (
                <div
                  key={player.id}
                  className="flex flex-col gap-2 border-b pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-32 font-medium">{player.full_name}</span>
                  <PlayerStatsRowForm
                    matchId={matchId}
                    playerId={player.id}
                    stat={statByPlayer.get(player.id)}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {match.status === "joue" && players && players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vote MVP</CardTitle>
          </CardHeader>
          <CardContent>
            <MvpVoting matchId={matchId} players={players} tally={mvpTally} myVote={myMvpVote} />
          </CardContent>
        </Card>
      )}

      {match.status === "joue" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Photos du match</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchPhotoGallery
              matchId={matchId}
              photos={(photos ?? []).map((p) => ({ id: p.id, storagePath: p.storage_path, caption: p.caption }))}
            />
          </CardContent>
        </Card>
      )}

      {match.status === "joue" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vidéo &amp; tags</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchVideoSection matchId={matchId} clips={videoClips ?? []} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
