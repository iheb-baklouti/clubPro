"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export interface ComparableFormation {
  id: string;
  label: string;
  data: FormationData;
}

interface Player {
  id: string;
  full_name: string;
  jersey_number: number | null;
}

function FormationPanel({
  options,
  selectedId,
  onSelect,
  playersById,
}: {
  options: ComparableFormation[];
  selectedId: string;
  onSelect: (id: string) => void;
  playersById: Map<string, Player>;
}) {
  const selected = options.find((o) => o.id === selectedId);

  const sceneProps: FormationSceneProps | null = selected
    ? {
        slots: selected.data.slots,
        arrows: selected.data.arrows,
        ball: selected.data.ball,
        playersById,
        selectedSlotId: null,
        interactive: false,
      }
    : null;

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <Select value={selectedId} onValueChange={onSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir une formation" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-900 sm:aspect-video">
          {sceneProps ? (
            <FormationScene {...sceneProps} />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-white/70">
              Choisissez une formation à afficher.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function FormationComparer({
  options,
  players,
}: {
  options: ComparableFormation[];
  players: Player[];
}) {
  const playersById = new Map(players.map((p) => [p.id, p]));
  const [leftId, setLeftId] = useState(options[0]?.id ?? "");
  const [rightId, setRightId] = useState(options[1]?.id ?? options[0]?.id ?? "");

  if (options.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Aucune formation sauvegardée pour le moment (modèle de bibliothèque ou formation de
          match).
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormationPanel options={options} selectedId={leftId} onSelect={setLeftId} playersById={playersById} />
      <FormationPanel options={options} selectedId={rightId} onSelect={setRightId} playersById={playersById} />
    </div>
  );
}
