"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, Pause, Play, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createFormationFromTemplate,
  interpolateFormations,
  type FormationData,
} from "@/lib/formations";
import { deleteTacticalSnapshot } from "@/app/(dashboard)/calendrier/tactical-snapshots-actions";
import { SnapshotEditorDialog } from "@/components/features/formations-3d/snapshot-editor-dialog";
import type { FormationSceneProps } from "@/components/features/formations-3d/formation-scene";
import {
  YoutubeSyncPlayer,
  type YoutubeSyncPlayerHandle,
} from "@/components/features/formations-3d/youtube-sync-player";
import { getYoutubeVideoId } from "@/lib/video-embed";

const FormationScene = dynamic(
  () => import("@/components/features/formations-3d/formation-scene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg bg-slate-900 sm:aspect-video">
        <Loader2 className="h-6 w-6 animate-spin text-white/70" />
      </div>
    ),
  },
);

interface Player {
  id: string;
  full_name: string;
  jersey_number: number | null;
  status: "actif" | "blesse" | "suspendu";
}

interface Snapshot {
  id: string;
  label: string;
  timestampSeconds: number;
  data: FormationData;
}

interface VideoClip {
  id: string;
  tag_type: "but" | "occasion" | "faute" | "carton";
  timestamp_seconds: number;
  description: string | null;
}

const TAG_LABELS: Record<VideoClip["tag_type"], string> = {
  but: "But",
  occasion: "Occasion",
  faute: "Faute",
  carton: "Carton",
};

const SPEEDS = [0.5, 1, 2, 4];
const DEFAULT_MAX_SECONDS = 90 * 60;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}'${seconds.toString().padStart(2, "0")}`;
}

export function TacticalTimeline({
  matchId,
  players,
  snapshots,
  videoClips,
  videoUrl,
}: {
  matchId: string;
  players: Player[];
  snapshots: Snapshot[];
  videoClips: VideoClip[];
  videoUrl?: string | null;
}) {
  const router = useRouter();
  const playersById = new Map(players.map((p) => [p.id, p]));
  const videoId = videoUrl ? getYoutubeVideoId(videoUrl) : null;
  const videoPlayerRef = useRef<YoutubeSyncPlayerHandle>(null);

  const maxTime = useMemo(() => {
    const times = [
      DEFAULT_MAX_SECONDS,
      ...snapshots.map((s) => s.timestampSeconds),
      ...videoClips.map((c) => c.timestamp_seconds),
    ];
    return Math.max(...times);
  }, [snapshots, videoClips]);

  const [currentTime, setCurrentTime] = useState(snapshots[0]?.timestampSeconds ?? 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isPending, startTransition] = useTransition();
  const frameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  useEffect(() => {
    // Quand une vidéo est synchronisée, c'est elle qui pilote le temps
    // (via onTick du lecteur YouTube) — pas besoin d'un second minuteur RAF.
    if (!isPlaying || videoId) {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      lastTickRef.current = null;
      return;
    }

    function tick(now: number) {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const deltaSeconds = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + deltaSeconds * speed;
        if (next >= maxTime) {
          setIsPlaying(false);
          return maxTime;
        }
        return next;
      });

      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, speed, maxTime, videoId]);

  const displayedFormation = useMemo<FormationData | null>(() => {
    if (snapshots.length === 0) return null;
    if (snapshots.length === 1) return snapshots[0]!.data;

    let prev = snapshots[0]!;
    let next: Snapshot | null = null;
    for (const snapshot of snapshots) {
      if (snapshot.timestampSeconds <= currentTime) {
        prev = snapshot;
      } else {
        next = snapshot;
        break;
      }
    }

    if (!next) return prev.data;
    if (currentTime <= prev.timestampSeconds) return prev.data;

    const span = next.timestampSeconds - prev.timestampSeconds;
    const progress = span > 0 ? (currentTime - prev.timestampSeconds) / span : 0;
    return interpolateFormations(prev.data, next.data, progress);
  }, [snapshots, currentTime]);

  const baseFormationForNewSnapshot = displayedFormation ?? createFormationFromTemplate("4-4-2");

  const sceneProps: FormationSceneProps | null = displayedFormation
    ? {
        slots: displayedFormation.slots,
        arrows: displayedFormation.arrows,
        ball: displayedFormation.ball,
        playersById,
        selectedSlotId: null,
        interactive: false,
      }
    : null;

  function handleDelete(snapshotId: string) {
    startTransition(async () => {
      await deleteTacticalSnapshot(snapshotId, matchId);
      router.refresh();
    });
  }

  function seekTo(seconds: number) {
    setCurrentTime(seconds);
    videoPlayerRef.current?.seekTo(seconds);
  }

  function togglePlay() {
    if (videoId) {
      if (isPlaying) videoPlayerRef.current?.pause();
      else videoPlayerRef.current?.play();
      // onPlayStateChange confirmera l'état réel du lecteur.
    }
    setIsPlaying((v) => !v);
  }

  function handleSpeedChange(next: number) {
    setSpeed(next);
    // YouTube ne supporte pas x4 : on plafonne à x2 pour la vidéo, la
    // timeline 3D seule (sans vidéo) garde la pleine vitesse choisie.
    videoPlayerRef.current?.setPlaybackRate(Math.min(next, 2));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        {videoId && (
          <Card>
            <CardContent className="p-4">
              <YoutubeSyncPlayer
                ref={videoPlayerRef}
                videoId={videoId}
                onTick={setCurrentTime}
                onPlayStateChange={setIsPlaying}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                La vidéo pilote le curseur ci-dessous : le pitch 3D suit sa position en direct.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
        <CardContent className="space-y-3 p-4">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-900 sm:aspect-video">
            {sceneProps ? (
              <FormationScene {...sceneProps} />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/70">
                Aucun instantané pour le moment. Créez-en un pour démarrer la timeline.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={isPlaying ? "Pause" : "Lecture"}
                disabled={snapshots.length < 2 && !videoId}
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <input
                type="range"
                min={0}
                max={maxTime}
                step={1}
                value={currentTime}
                onChange={(e) => {
                  if (videoId) videoPlayerRef.current?.pause();
                  setIsPlaying(false);
                  seekTo(Number(e.target.value));
                }}
                className="flex-1"
              />

              <span className="w-14 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                {formatTime(currentTime)}
              </span>

              <Select value={String(speed)} onValueChange={(v) => handleSpeedChange(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEEDS.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      x{s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative h-4">
              {snapshots.map((snapshot) => (
                <button
                  key={snapshot.id}
                  type="button"
                  title={`${snapshot.label} — ${formatTime(snapshot.timestampSeconds)}`}
                  className="absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full border border-background bg-primary"
                  style={{ left: `${(snapshot.timestampSeconds / maxTime) * 100}%` }}
                  onClick={() => {
                    videoPlayerRef.current?.pause();
                    setIsPlaying(false);
                    seekTo(snapshot.timestampSeconds);
                  }}
                />
              ))}
              {videoClips.map((clip) => (
                <button
                  key={clip.id}
                  type="button"
                  title={`${TAG_LABELS[clip.tag_type]} — ${formatTime(clip.timestamp_seconds)}`}
                  className="absolute top-0 h-3 w-1.5 -translate-x-1/2 bg-amber-500"
                  style={{ left: `${(clip.timestamp_seconds / maxTime) * 100}%` }}
                  onClick={() => {
                    videoPlayerRef.current?.pause();
                    setIsPlaying(false);
                    seekTo(clip.timestamp_seconds);
                  }}
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            L&apos;animation entre deux instantanés est une interpolation, pas un replay de mouvements
            réellement captés. Les points bleus sont les instantanés, les repères orange les événements vidéo.
          </p>
        </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <SnapshotEditorDialog
          matchId={matchId}
          players={players}
          baseFormation={baseFormationForNewSnapshot}
          defaultTimestamp={currentTime}
          onCreated={() => router.refresh()}
        />

        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-semibold">Instantanés ({snapshots.length})</p>
            {snapshots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun instantané enregistré.</p>
            ) : (
              snapshots.map((snapshot) => (
                <div key={snapshot.id} className="flex items-center justify-between gap-2 text-sm">
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left hover:underline"
                    onClick={() => {
                      videoPlayerRef.current?.pause();
                      setIsPlaying(false);
                      seekTo(snapshot.timestampSeconds);
                    }}
                  >
                    {formatTime(snapshot.timestampSeconds)} — {snapshot.label}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer l'instantané"
                    disabled={isPending}
                    onClick={() => handleDelete(snapshot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {videoClips.length > 0 && (
          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-semibold">Événements vidéo ({videoClips.length})</p>
              {videoClips.map((clip) => (
                <button
                  key={clip.id}
                  type="button"
                  className="block w-full truncate text-left text-sm hover:underline"
                  onClick={() => {
                    videoPlayerRef.current?.pause();
                    setIsPlaying(false);
                    seekTo(clip.timestamp_seconds);
                  }}
                >
                  {formatTime(clip.timestamp_seconds)} — {TAG_LABELS[clip.tag_type]}
                  {clip.description ? ` (${clip.description})` : ""}
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
