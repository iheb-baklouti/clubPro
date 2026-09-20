"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Loader2, Pause, Play, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createFormationFromTemplate, interpolateFormations, type FormationData } from "@/lib/formations";
import { renameSequence, updateSequenceSteps } from "@/app/(dashboard)/simulations/actions";
import { SequenceStepDialog } from "@/components/features/formations-3d/sequence-step-dialog";
import type { FormationSceneProps } from "@/components/features/formations-3d/formation-scene";

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
}

export interface SequenceStep {
  id: string;
  label: string;
  timestampSeconds: number;
  data: FormationData;
}

const SPEEDS = [0.5, 1, 2];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function SequenceEditor({
  sequenceId,
  initialName,
  initialNotes,
  players,
  initialSteps,
}: {
  sequenceId: string;
  initialName: string;
  initialNotes: string;
  players: Player[];
  initialSteps: SequenceStep[];
}) {
  const playersById = new Map(players.map((p) => [p.id, p]));

  const [steps, setSteps] = useState(
    [...initialSteps].sort((a, b) => a.timestampSeconds - b.timestampSeconds),
  );
  const [name, setName] = useState(initialName);
  const [notes, setNotes] = useState(initialNotes);
  const [currentTime, setCurrentTime] = useState(steps[0]?.timestampSeconds ?? 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const maxTime = useMemo(() => {
    const last = steps.at(-1)?.timestampSeconds ?? 30;
    return Math.max(30, last + 5);
  }, [steps]);

  useEffect(() => {
    if (!isPlaying) {
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
  }, [isPlaying, speed, maxTime]);

  const displayedFormation = useMemo<FormationData | null>(() => {
    if (steps.length === 0) return null;
    if (steps.length === 1) return steps[0]!.data;

    let prev = steps[0]!;
    let next: SequenceStep | null = null;
    for (const step of steps) {
      if (step.timestampSeconds <= currentTime) prev = step;
      else {
        next = step;
        break;
      }
    }
    if (!next || currentTime <= prev.timestampSeconds) return prev.data;

    const span = next.timestampSeconds - prev.timestampSeconds;
    const progress = span > 0 ? (currentTime - prev.timestampSeconds) / span : 0;
    return interpolateFormations(prev.data, next.data, progress);
  }, [steps, currentTime]);

  const baseFormationForNewStep = displayedFormation ?? createFormationFromTemplate("4-4-2");

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

  function persist(nextSteps: SequenceStep[]) {
    startTransition(async () => {
      await updateSequenceSteps(sequenceId, nextSteps);
      setSavedAt(Date.now());
    });
  }

  function handleAddStep(step: SequenceStep) {
    const next = [...steps, step].sort((a, b) => a.timestampSeconds - b.timestampSeconds);
    setSteps(next);
    persist(next);
  }

  function handleDeleteStep(stepId: string) {
    const next = steps.filter((s) => s.id !== stepId);
    setSteps(next);
    persist(next);
  }

  function handleSaveName() {
    startTransition(async () => {
      await renameSequence(sequenceId, name, notes);
      setSavedAt(Date.now());
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-64" />
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optionnel)"
              className="flex-1"
            />
            <Button type="button" size="sm" variant="outline" onClick={handleSaveName} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </Button>
          </div>

          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-900 sm:aspect-video">
            {sceneProps ? (
              <FormationScene {...sceneProps} />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/70">
                Aucune étape pour le moment. Ajoutez-en une pour démarrer la simulation.
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={isPlaying ? "Pause" : "Lecture"}
              disabled={steps.length < 2}
              onClick={() => setIsPlaying((v) => !v)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <input
              type="range"
              min={0}
              max={maxTime}
              step={0.5}
              value={currentTime}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentTime(Number(e.target.value));
              }}
              className="flex-1"
            />

            <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
              {formatTime(currentTime)}
            </span>

            <Select value={String(speed)} onValueChange={(v) => setSpeed(Number(v))}>
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

          <p className="text-xs text-muted-foreground">
            {savedAt ? "Enregistré." : "L'animation entre deux étapes est une interpolation."}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <SequenceStepDialog
          players={players}
          baseFormation={baseFormationForNewStep}
          defaultTimestamp={currentTime}
          onSave={handleAddStep}
        />

        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-semibold">Étapes ({steps.length})</p>
            {steps.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune étape enregistrée.</p>
            ) : (
              steps.map((step) => (
                <div key={step.id} className="flex items-center justify-between gap-2 text-sm">
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left hover:underline"
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentTime(step.timestampSeconds);
                    }}
                  >
                    {formatTime(step.timestampSeconds)} — {step.label}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer l'étape"
                    disabled={isPending}
                    onClick={() => handleDeleteStep(step.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
