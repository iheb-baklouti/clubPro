"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMatchResult } from "@/app/(dashboard)/calendrier/actions";
import type { Database } from "@/lib/types/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];

export function MatchResultForm({ match }: { match: Match }) {
  const [status, setStatus] = useState<Match["status"]>(match.status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setError(null);
        setSaved(false);
        startTransition(async () => {
          const result = await updateMatchResult(match.id, {}, formData);
          if (result?.error) setError(result.error);
          else setSaved(true);
        });
      }}
    >
      <div className="space-y-2">
        <Label>Statut</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as Match["status"])}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a_venir">À venir</SelectItem>
            <SelectItem value="joue">Joué</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="status" value={status} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scoreHome">Score domicile</Label>
        <Input
          id="scoreHome"
          name="scoreHome"
          type="number"
          min={0}
          className="w-28"
          defaultValue={match.score_home ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="scoreAway">Score extérieur</Label>
        <Input
          id="scoreAway"
          name="scoreAway"
          type="number"
          min={0}
          className="w-28"
          defaultValue={match.score_away ?? ""}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Enregistrer
      </Button>

      {saved && !isPending && <p className="text-sm text-primary">Enregistré ✓</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
