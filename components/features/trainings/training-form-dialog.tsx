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
import { trainingSchema, type TrainingInput } from "@/lib/validations/trainings";
import { createTraining, updateTraining } from "@/app/(dashboard)/entrainements/actions";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/format";

const TYPE_LABELS: Record<TrainingInput["type"], string> = {
  physique: "Physique",
  technique: "Technique",
  tactique: "Tactique",
  recuperation: "Récupération",
};

interface TrainingFormDialogProps {
  mode: "create" | "edit";
  teams: { id: string; name: string }[];
  training?: {
    id: string;
    team_id: string;
    date: string;
    type: TrainingInput["type"];
    description: string | null;
  };
  defaultTeamId?: string;
}

export function TrainingFormDialog({
  mode,
  teams,
  training,
  defaultTeamId,
}: TrainingFormDialogProps) {
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
  } = useForm<TrainingInput>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      teamId: training?.team_id ?? defaultTeamId ?? teams[0]?.id ?? "",
      date: training ? toDatetimeLocalValue(training.date) : "",
      type: training?.type ?? "technique",
      description: training?.description ?? "",
    },
  });

  const teamId = watch("teamId");
  const type = watch("type");

  const onSubmit = (values: TrainingInput) => {
    setServerError(null);
    const formData = new FormData();
    formData.set("teamId", values.teamId);
    formData.set("date", fromDatetimeLocalValue(values.date));
    formData.set("type", values.type);
    formData.set("description", values.description ?? "");

    startTransition(async () => {
      const result =
        mode === "edit" && training
          ? await updateTraining(training.id, {}, formData)
          : await createTraining({}, formData);

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
            Nouvelle séance
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Modifier la séance">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nouvelle séance d'entraînement" : "Modifier la séance"}
          </DialogTitle>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date et heure</Label>
              <Input id="date" type="datetime-local" {...register("date")} />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setValue("type", v as TrainingInput["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Thème de la séance..." {...register("description")} />
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending || teams.length === 0}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
          {teams.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Créez d&apos;abord une équipe avant de planifier une séance.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
