"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveScoutingNote } from "@/app/(dashboard)/calendrier/scouting-actions";

export interface ScoutingNote {
  strengths: string | null;
  weaknesses: string | null;
  key_players: string | null;
  notes: string | null;
}

export function ScoutingNotesForm({ matchId, initial }: { matchId: string; initial: ScoutingNote | null }) {
  const [strengths, setStrengths] = useState(initial?.strengths ?? "");
  const [weaknesses, setWeaknesses] = useState(initial?.weaknesses ?? "");
  const [keyPlayers, setKeyPlayers] = useState(initial?.key_players ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function handleSave() {
    startTransition(async () => {
      await saveScoutingNote(matchId, { strengths, weaknesses, keyPlayers, notes });
      setSavedAt(Date.now());
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Observations manuelles sur l&apos;adversaire — aucune donnée réelle sur les clubs amateurs
        adverses n&apos;étant disponible, ces notes sont saisies par le staff.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="scouting-strengths">Points forts</Label>
          <Textarea
            id="scouting-strengths"
            rows={3}
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="ex: Jeu long, transitions rapides..."
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="scouting-weaknesses">Points faibles</Label>
          <Textarea
            id="scouting-weaknesses"
            rows={3}
            value={weaknesses}
            onChange={(e) => setWeaknesses(e.target.value)}
            placeholder="ex: Vulnérable sur coup de pied arrêté..."
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="scouting-key-players">Joueurs clés</Label>
          <Textarea
            id="scouting-key-players"
            rows={3}
            value={keyPlayers}
            onChange={(e) => setKeyPlayers(e.target.value)}
            placeholder="ex: N°10 très mobile, à surveiller..."
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="scouting-notes">Autres notes</Label>
          <Textarea
            id="scouting-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Consignes tactiques, historique des confrontations..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </Button>
        {savedAt && <span className="text-sm text-muted-foreground">Enregistré.</span>}
      </div>
    </div>
  );
}
