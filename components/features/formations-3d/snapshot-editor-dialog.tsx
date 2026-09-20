"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTacticalSnapshot } from "@/app/(dashboard)/calendrier/tactical-snapshots-actions";
import type { FormationData } from "@/lib/formations";
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

export function SnapshotEditorDialog({
  matchId,
  players,
  baseFormation,
  defaultTimestamp,
  onCreated,
}: {
  matchId: string;
  players: Player[];
  baseFormation: FormationData;
  defaultTimestamp: number;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [formation, setFormation] = useState<FormationData>(baseFormation);
  const [label, setLabel] = useState("");
  const [timestampSeconds, setTimestampSeconds] = useState(Math.round(defaultTimestamp));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const playersById = new Map(players.map((p) => [p.id, p]));

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setFormation(baseFormation);
      setLabel("");
      setTimestampSeconds(Math.round(defaultTimestamp));
      setError(null);
    }
  }

  function updateSlot(slotId: string, x: number, y: number) {
    setFormation((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.id === slotId ? { ...s, x, y } : s)),
    }));
  }

  function updateBall(x: number, y: number) {
    setFormation((prev) => ({ ...prev, ball: { x, y } }));
  }

  const sceneProps: FormationSceneProps = {
    slots: formation.slots,
    arrows: formation.arrows,
    ball: formation.ball,
    playersById,
    selectedSlotId: null,
    interactive: true,
    onSlotMove: updateSlot,
    onBallMove: updateBall,
  };

  function handleSave() {
    if (!label.trim()) {
      setError("Le libellé est requis.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createTacticalSnapshot(matchId, label, timestampSeconds, formation);
      if (result?.error) setError(result.error);
      else {
        setOpen(false);
        onCreated();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus className="h-4 w-4" />
          Nouvel instantané
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un instantané tactique</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="snapshot-label">Libellé</Label>
            <Input
              id="snapshot-label"
              placeholder="ex: Ouverture du score"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="snapshot-timestamp">Minute (secondes)</Label>
            <Input
              id="snapshot-timestamp"
              type="number"
              min={0}
              value={timestampSeconds}
              onChange={(e) => setTimestampSeconds(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Glissez les joueurs et le ballon pour reproduire la position de l&apos;équipe à cet instant.
        </p>

        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg sm:aspect-video">
          <FormationScene {...sceneProps} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Créer l&apos;instantané
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
