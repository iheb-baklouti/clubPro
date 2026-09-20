"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { Loader2, Redo2, Route, Save, Undo2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FORMATION_TEMPLATES,
  FORMATION_TYPES,
  createFormationFromTemplate,
  remapFormationToTemplate,
  type FormationData,
} from "@/lib/formations";
import { saveFormation } from "@/app/(dashboard)/calendrier/actions";
import { FormationLibraryDialog } from "@/components/features/formations-3d/formation-library-dialog";
import { PlayerStatsPanel } from "@/components/features/formations-3d/player-stats-panel";
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
  status: "actif" | "blesse" | "suspendu";
}

export function FormationEditor3D({
  matchId,
  players,
  initialData,
  suggestedFormationType,
}: {
  matchId: string;
  players: Player[];
  initialData: FormationData | null;
  suggestedFormationType: string | null;
}) {
  const [formation, setFormation] = useState<FormationData | null>(initialData);
  const [history, setHistory] = useState<FormationData[]>(initialData ? [initialData] : []);
  const [historyIndex, setHistoryIndex] = useState(0);
  const formationRef = useRef<FormationData | null>(initialData);
  formationRef.current = formation;

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const playersById = new Map(players.map((p) => [p.id, p]));

  function recordHistory(next: FormationData) {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), next]);
    setHistoryIndex((i) => i + 1);
  }

  function applyFormation(next: FormationData, record = true) {
    setFormation(next);
    if (record) recordHistory(next);
  }

  function updateLive(updater: (prev: FormationData) => FormationData) {
    setFormation((prev) => (prev ? updater(prev) : prev));
  }

  function commitLive() {
    if (formationRef.current) recordHistory(formationRef.current);
  }

  function undo() {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setFormation(history[newIndex] ?? null);
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setFormation(history[newIndex] ?? null);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMeta = e.ctrlKey || e.metaKey;
      if (!isMeta || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIndex, history]);

  function handleFormationTypeChange(type: string) {
    const next = formation ? remapFormationToTemplate(formation, type) : createFormationFromTemplate(type);
    applyFormation(next);
  }

  function handleSuggest() {
    const formationType = suggestedFormationType ?? formation?.formationType ?? "4-4-2";
    const base = createFormationFromTemplate(formationType);
    const available = players
      .filter((p) => p.status === "actif")
      .sort((a, b) => (a.jersey_number ?? 99) - (b.jersey_number ?? 99));

    applyFormation({
      ...base,
      slots: base.slots.map((slot, index) => ({ ...slot, playerId: available[index]?.id ?? null })),
    });
  }

  function handlePitchPoint(x: number, y: number) {
    if (!arrowStart) {
      setArrowStart({ x, y });
      return;
    }
    updateLive((prev) => ({
      ...prev,
      arrows: [...prev.arrows, { id: crypto.randomUUID(), x1: arrowStart.x, y1: arrowStart.y, x2: x, y2: y }],
    }));
    commitLive();
    setArrowStart(null);
  }

  function assignPlayer(slotId: string, playerId: string | null) {
    if (!formation) return;
    applyFormation({
      ...formation,
      slots: formation.slots.map((s) => (s.id === slotId ? { ...s, playerId } : s)),
    });
  }

  function removeArrow(arrowId: string) {
    if (!formation) return;
    applyFormation({ ...formation, arrows: formation.arrows.filter((a) => a.id !== arrowId) });
  }

  function handleSave() {
    if (!formation) return;
    setError(null);
    startTransition(async () => {
      const result = await saveFormation(matchId, formation);
      if (result?.error) setError(result.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  const assignedPlayerIds = new Set(
    formation?.slots.map((s) => s.playerId).filter((id): id is string => Boolean(id)) ?? [],
  );

  const selectedSlot = formation?.slots.find((s) => s.id === selectedSlotId) ?? null;

  const sceneProps: FormationSceneProps | null = formation
    ? {
        slots: formation.slots,
        arrows: formation.arrows,
        ball: formation.ball,
        playersById,
        selectedSlotId,
        interactive: true,
        isDrawingArrow,
        arrowStart,
        onSlotMove: (slotId, x, y) =>
          updateLive((prev) => ({
            ...prev,
            slots: prev.slots.map((s) => (s.id === slotId ? { ...s, x, y } : s)),
          })),
        onSlotMoveEnd: commitLive,
        onBallMove: (x, y) => updateLive((prev) => ({ ...prev, ball: { x, y } })),
        onBallMoveEnd: commitLive,
        onSelectSlot: setSelectedSlotId,
        onPitchPoint: handlePitchPoint,
      }
    : null;

  if (!formation) {
    return (
      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-muted-foreground">
            Choisissez une formation de départ pour commencer à composer votre équipe.
          </p>
          <div className="flex flex-wrap gap-2">
            {FORMATION_TYPES.map((type) => (
              <Button key={type} variant="outline" onClick={() => applyFormation(createFormationFromTemplate(type))}>
                {type}
                {type === suggestedFormationType && (
                  <Badge variant="secondary" className="ml-1">
                    Suggérée
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          <Button onClick={handleSuggest}>
            <Wand2 className="h-4 w-4" />
            Suggérer automatiquement
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={formation.formationType} onValueChange={handleFormationTypeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(FORMATION_TEMPLATES).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="button" variant="outline" size="sm" onClick={handleSuggest}>
              <Wand2 className="h-4 w-4" />
              Suggérer
            </Button>

            <FormationLibraryDialog
              currentFormation={formation}
              onLoad={(data) => applyFormation(data)}
            />

            <div className="ml-auto flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Annuler"
                disabled={historyIndex <= 0}
                onClick={undo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Rétablir"
                disabled={historyIndex >= history.length - 1}
                onClick={redo}
              >
                <Redo2 className="h-4 w-4" />
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
              <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Glissez les joueurs et le ballon. Ctrl/Cmd+Z pour annuler, Ctrl/Cmd+Shift+Z pour rétablir.
            Molette pour zoomer, clic-glisser pour tourner la caméra.
          </p>

          <div className="aspect-[3/4] w-full overflow-hidden rounded-lg sm:aspect-video">
            {sceneProps && <FormationScene {...sceneProps} />}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && !isPending && <p className="text-sm text-primary">Formation enregistrée ✓</p>}

          {formation.arrows.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-semibold">Flèches ({formation.arrows.length})</p>
              {formation.arrows.map((arrow, index) => (
                <div key={arrow.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Flèche {index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeArrow(arrow.id)}>
                    Retirer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {selectedSlot?.playerId ? (
          <PlayerStatsPanel playerId={selectedSlot.playerId} />
        ) : (
          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-semibold">Composition</p>
              {formation.slots.map((slot) => (
                <div key={slot.id} className="flex items-center gap-2">
                  <span className="w-10 shrink-0 text-xs font-medium text-muted-foreground">
                    {slot.label}
                  </span>
                  <Select
                    value={slot.playerId ?? "none"}
                    onValueChange={(v) => assignPlayer(slot.id, v === "none" ? null : v)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="— Non assigné —" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Non assigné —</SelectItem>
                      {players.map((p) => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          disabled={assignedPlayerIds.has(p.id) && slot.playerId !== p.id}
                        >
                          {p.full_name}
                          {p.jersey_number ? ` #${p.jersey_number}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <p className="pt-1 text-xs text-muted-foreground">
                Cliquez un joueur sur le terrain pour voir ses statistiques.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
