"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Circle, Loader2, Plus, Route, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FormationData } from "@/lib/formations";
import { updateDrillDiagram } from "@/app/(dashboard)/drills/actions";
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

const EMPTY_DIAGRAM: FormationData = {
  formationType: "exercice",
  slots: [],
  arrows: [],
};

export function DrillDiagramEditor({
  drillId,
  initialData,
}: {
  drillId: string;
  initialData: FormationData | null;
}) {
  const [diagram, setDiagram] = useState<FormationData>(initialData ?? EMPTY_DIAGRAM);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function addMarker() {
    const n = diagram.slots.length + 1;
    setDiagram((prev) => ({
      ...prev,
      slots: [...prev.slots, { id: crypto.randomUUID(), label: `P${n}`, x: 50, y: 50, playerId: null }],
    }));
  }

  function removeSelected() {
    if (!selectedSlotId) return;
    setDiagram((prev) => ({ ...prev, slots: prev.slots.filter((s) => s.id !== selectedSlotId) }));
    setSelectedSlotId(null);
  }

  function toggleBall() {
    setDiagram((prev) => ({ ...prev, ball: prev.ball ? undefined : { x: 50, y: 50 } }));
  }

  function handlePitchPoint(x: number, y: number) {
    if (!arrowStart) {
      setArrowStart({ x, y });
      return;
    }
    setDiagram((prev) => ({
      ...prev,
      arrows: [...prev.arrows, { id: crypto.randomUUID(), x1: arrowStart.x, y1: arrowStart.y, x2: x, y2: y }],
    }));
    setArrowStart(null);
  }

  function removeArrow(arrowId: string) {
    setDiagram((prev) => ({ ...prev, arrows: prev.arrows.filter((a) => a.id !== arrowId) }));
  }

  function handleSave() {
    startTransition(async () => {
      await updateDrillDiagram(drillId, diagram);
      setSavedAt(Date.now());
    });
  }

  const sceneProps: FormationSceneProps = {
    slots: diagram.slots,
    arrows: diagram.arrows,
    ball: diagram.ball,
    playersById: new Map(),
    selectedSlotId,
    interactive: true,
    isDrawingArrow,
    arrowStart,
    onSlotMove: (slotId, x, y) =>
      setDiagram((prev) => ({
        ...prev,
        slots: prev.slots.map((s) => (s.id === slotId ? { ...s, x, y } : s)),
      })),
    onBallMove: (x, y) => setDiagram((prev) => ({ ...prev, ball: { x, y } })),
    onSelectSlot: setSelectedSlotId,
    onPitchPoint: handlePitchPoint,
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addMarker}>
              <Plus className="h-4 w-4" />
              Plot / joueur
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={toggleBall}>
              <Circle className="h-4 w-4" />
              {diagram.ball ? "Retirer le ballon" : "Ajouter le ballon"}
            </Button>
            <Button
              type="button"
              variant={isDrawingArrow ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsDrawingArrow((v) => !v);
                setArrowStart(null);
              }}
            >
              <Route className="h-4 w-4" />
              Flèche
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!selectedSlotId}
              onClick={removeSelected}
            >
              <Trash2 className="h-4 w-4" />
              Retirer le plot sélectionné
            </Button>
            <Button type="button" size="sm" className="ml-auto" onClick={handleSave} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Cliquez un plot pour le sélectionner (puis &laquo;&nbsp;Retirer&nbsp;&raquo;), glissez pour repositionner.
            {savedAt ? " Schéma enregistré." : ""}
          </p>

          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-900 sm:aspect-video">
            <FormationScene {...sceneProps} />
          </div>
        </CardContent>
      </Card>

      {diagram.arrows.length > 0 && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-semibold">Flèches ({diagram.arrows.length})</p>
            {diagram.arrows.map((arrow, index) => (
              <div key={arrow.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Flèche {index + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => removeArrow(arrow.id)}>
                  Retirer
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
