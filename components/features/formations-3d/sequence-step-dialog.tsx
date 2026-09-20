"use client";

import { useState } from "react";
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

/** Généralisation de SnapshotEditorDialog sans dépendance à un match — utilisé
 * par les séquences tactiques réutilisables (Phase 3, "simulation"). */
export function SequenceStepDialog({
  players,
  baseFormation,
  defaultTimestamp,
  onSave,
}: {
  players: Player[];
  baseFormation: FormationData;
  defaultTimestamp: number;
  onSave: (step: { id: string; label: string; timestampSeconds: number; data: FormationData }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [formation, setFormation] = useState<FormationData>(baseFormation);
  const [label, setLabel] = useState("");
  const [timestampSeconds, setTimestampSeconds] = useState(Math.round(defaultTimestamp));
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
    onSave({
      id: crypto.randomUUID(),
      label: label.trim(),
      timestampSeconds,
      data: formation,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus className="h-4 w-4" />
          Nouvelle étape
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter une étape</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="step-label">Libellé</Label>
            <Input
              id="step-label"
              placeholder="ex: Centre au second poteau"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="step-timestamp">Temps (secondes)</Label>
            <Input
              id="step-timestamp"
              type="number"
              min={0}
              value={timestampSeconds}
              onChange={(e) => setTimestampSeconds(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Glissez les joueurs et le ballon pour reproduire la position souhaitée à cette étape.
        </p>

        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg sm:aspect-video">
          <FormationScene {...sceneProps} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSave}>
            <Plus className="h-4 w-4" />
            Ajouter l&apos;étape
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
