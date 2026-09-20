"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addTrainingExercise, removeTrainingExercise } from "@/app/(dashboard)/entrainements/actions";

interface Drill {
  id: string;
  title: string;
  category: string;
}

interface SessionExercise {
  id: string;
  duration_minutes: number;
  drills: { id: string; title: string; category: string } | null;
}

export function ExerciseComposer({
  trainingId,
  drills,
  exercises,
}: {
  trainingId: string;
  drills: Drill[];
  exercises: SessionExercise[];
}) {
  const [drillId, setDrillId] = useState(drills[0]?.id ?? "");
  const [duration, setDuration] = useState("10");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalMinutes = exercises.reduce((sum, e) => sum + e.duration_minutes, 0);

  return (
    <div className="space-y-4">
      {exercises.length === 0 ? (
        <p className="text-muted-foreground">Aucun exercice ajouté à cette séance.</p>
      ) : (
        <ul className="space-y-2">
          {exercises.map((exercise, index) => (
            <li
              key={exercise.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <span>
                <span className="text-muted-foreground">{index + 1}.</span>{" "}
                <span className="font-medium">{exercise.drills?.title ?? "Exercice supprimé"}</span>{" "}
                <span className="text-sm text-muted-foreground">
                  · {exercise.duration_minutes} min
                </span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Retirer"
                onClick={() =>
                  startTransition(async () => {
                    await removeTrainingExercise(exercise.id, trainingId);
                  })
                }
                disabled={isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
          <li className="text-right text-sm text-muted-foreground">
            Total : {totalMinutes} min
          </li>
        </ul>
      )}

      {drills.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ajoutez d&apos;abord des exercices à la bibliothèque pour composer cette séance.
        </p>
      ) : (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const formData = new FormData();
            formData.set("drillId", drillId);
            formData.set("durationMinutes", duration);
            startTransition(async () => {
              const result = await addTrainingExercise(trainingId, {}, formData);
              if (result?.error) setError(result.error);
            });
          }}
        >
          <div className="min-w-48 space-y-1">
            <Select value={drillId} onValueChange={setDrillId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un exercice" />
              </SelectTrigger>
              <SelectContent>
                {drills.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            type="number"
            min={1}
            max={180}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-24"
            aria-label="Durée en minutes"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Ajouter
          </Button>
        </form>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
