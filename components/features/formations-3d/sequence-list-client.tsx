"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Repeat, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createSequence,
  deleteSequence,
  type SequenceSummary,
} from "@/app/(dashboard)/simulations/actions";

export function SequenceListClient({
  sequences,
  teams,
}: {
  sequences: SequenceSummary[];
  teams: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createSequence(name, notes, teamId);
      if (result.error) setError(result.error);
      else if (result.id) {
        setOpen(false);
        setName("");
        setNotes("");
        router.push(`/simulations/${result.id}`);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSequence(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button">
            <Plus className="h-4 w-4" />
            Nouvelle simulation
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle simulation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="seq-name">Nom</Label>
              <Input
                id="seq-name"
                placeholder="ex: Corner offensif rentrant"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="seq-notes">Notes (optionnel)</Label>
              <Input id="seq-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Équipe</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une équipe" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleCreate} disabled={isPending || !teamId}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sequences.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <Repeat className="h-8 w-8" />
            <p>Aucune simulation pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sequences.map((sequence) => {
            const stepCount = Array.isArray(sequence.steps_json) ? sequence.steps_json.length : 0;
            return (
              <Card key={sequence.id} className="transition-colors hover:bg-accent/50">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/simulations/${sequence.id}`} className="min-w-0 flex-1">
                      <p className="truncate font-medium">{sequence.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sequence.teams?.name ?? "Équipe supprimée"} · {stepCount} étape
                        {stepCount > 1 ? "s" : ""}
                      </p>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Supprimer"
                      disabled={isPending}
                      onClick={() => handleDelete(sequence.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {sequence.notes && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{sequence.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
