"use client";

import { useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertPlayerStat } from "@/app/(dashboard)/calendrier/actions";
import type { Database } from "@/lib/types/database.types";

type PlayerStat = Database["public"]["Tables"]["player_stats"]["Row"];

export function PlayerStatsRowForm({
  matchId,
  playerId,
  stat,
}: {
  matchId: string;
  playerId: string;
  stat?: PlayerStat;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setError(null);
        setSaved(false);
        startTransition(async () => {
          const result = await upsertPlayerStat(matchId, playerId, formData);
          if (result?.error) setError(result.error);
          else {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }
        });
      }}
    >
      {(
        [
          { name: "goals", label: "Buts", defaultValue: stat?.goals ?? 0 },
          { name: "assists", label: "Passes D.", defaultValue: stat?.assists ?? 0 },
          { name: "yellowCards", label: "CJ", defaultValue: stat?.yellow_cards ?? 0, max: 2 },
          { name: "redCards", label: "CR", defaultValue: stat?.red_cards ?? 0, max: 1 },
          { name: "minutesPlayed", label: "Min", defaultValue: stat?.minutes_played ?? 0, max: 120 },
        ] as const
      ).map((field) => (
        <div key={field.name} className="flex flex-col items-center gap-1">
          <label htmlFor={`${playerId}-${field.name}`} className="text-[10px] text-muted-foreground">
            {field.label}
          </label>
          <Input
            id={`${playerId}-${field.name}`}
            name={field.name}
            type="number"
            min={0}
            max={"max" in field ? field.max : undefined}
            defaultValue={field.defaultValue}
            className="h-9 w-16 px-2 text-center"
          />
        </div>
      ))}

      <Button type="submit" size="icon" variant="outline" disabled={isPending} aria-label="Enregistrer">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
