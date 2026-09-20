"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";

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
import { teamSchema, type TeamInput } from "@/lib/validations/teams";
import { createTeam, updateTeam } from "@/app/(dashboard)/equipes/actions";

interface TeamFormDialogProps {
  mode: "create" | "edit";
  team?: { id: string; name: string; category: string };
}

export function TeamFormDialog({ mode, team }: TeamFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamInput>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: team?.name ?? "", category: team?.category ?? "" },
  });

  const onSubmit = (values: TeamInput) => {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("category", values.category);

    startTransition(async () => {
      const result =
        mode === "edit" && team
          ? await updateTeam(team.id, {}, formData)
          : await createTeam({}, formData);

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
            Nouvelle équipe
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Modifier l'équipe">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nouvelle équipe" : "Modifier l'équipe"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l&apos;équipe</Label>
            <Input id="name" placeholder="Seniors A" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Input id="category" placeholder="Seniors, U19, U17..." {...register("category")} />
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
