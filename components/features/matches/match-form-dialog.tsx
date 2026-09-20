"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { matchSchema, type MatchInput } from "@/lib/validations/matches";
import { createMatch, updateMatch } from "@/app/(dashboard)/calendrier/actions";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/format";

interface MatchFormDialogProps {
  mode: "create" | "edit";
  teams: { id: string; name: string }[];
  match?: {
    id: string;
    team_id: string;
    opponent_name: string;
    match_date: string;
    location: string | null;
    competition_type: string | null;
    home_or_away: "domicile" | "exterieur";
  };
  defaultTeamId?: string;
}

export function MatchFormDialog({ mode, teams, match, defaultTeamId }: MatchFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MatchInput>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      teamId: match?.team_id ?? defaultTeamId ?? teams[0]?.id ?? "",
      opponentName: match?.opponent_name ?? "",
      matchDate: match ? toDatetimeLocalValue(match.match_date) : "",
      location: match?.location ?? "",
      competitionType: match?.competition_type ?? "",
      homeOrAway: match?.home_or_away ?? "domicile",
    },
  });

  const teamId = watch("teamId");
  const homeOrAway = watch("homeOrAway");

  const onSubmit = (values: MatchInput) => {
    setServerError(null);
    const formData = new FormData();
    formData.set("teamId", values.teamId);
    formData.set("opponentName", values.opponentName);
    formData.set("matchDate", fromDatetimeLocalValue(values.matchDate));
    formData.set("location", values.location ?? "");
    formData.set("competitionType", values.competitionType ?? "");
    formData.set("homeOrAway", values.homeOrAway);

    startTransition(async () => {
      const result =
        mode === "edit" && match
          ? await updateMatch(match.id, {}, formData)
          : await createMatch({}, formData);

      if (result?.error) {
        setServerError(result.error);
        return;
      }
      setOpen(false);
      reset();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="h-4 w-4" />
            Nouveau match
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Modifier le match">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nouveau match" : "Modifier le match"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label>Équipe</Label>
            <Select value={teamId} onValueChange={(v) => setValue("teamId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une équipe" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teamId && <p className="text-sm text-destructive">{errors.teamId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="opponentName">Adversaire</Label>
            <Input id="opponentName" {...register("opponentName")} />
            {errors.opponentName && (
              <p className="text-sm text-destructive">{errors.opponentName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="matchDate">Date et heure</Label>
              <Input id="matchDate" type="datetime-local" {...register("matchDate")} />
              {errors.matchDate && (
                <p className="text-sm text-destructive">{errors.matchDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Domicile / Extérieur</Label>
              <Select
                value={homeOrAway}
                onValueChange={(v) => setValue("homeOrAway", v as MatchInput["homeOrAway"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domicile">Domicile</SelectItem>
                  <SelectItem value="exterieur">Extérieur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="location">Lieu</Label>
              <Input id="location" placeholder="Stade municipal" {...register("location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitionType">Compétition</Label>
              <Input id="competitionType" placeholder="Championnat, Coupe..." {...register("competitionType")} />
            </div>
          </div>

          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending || teams.length === 0}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
          {teams.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Créez d&apos;abord une équipe avant de planifier un match.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
