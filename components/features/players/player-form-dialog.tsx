"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { playerSchema, type PlayerInput } from "@/lib/validations/teams";
import { createPlayer, updatePlayer } from "@/app/(dashboard)/equipes/actions";
import type { Database } from "@/lib/types/database.types";

type Player = Database["public"]["Tables"]["players"]["Row"];

const STATUS_LABELS: Record<Player["status"], string> = {
  actif: "Actif",
  blesse: "Blessé",
  suspendu: "Suspendu",
};

interface PlayerFormDialogProps {
  mode: "create" | "edit";
  teamId: string;
  player?: Player;
}

export function PlayerFormDialog({ mode, teamId, player }: PlayerFormDialogProps) {
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
  } = useForm<PlayerInput>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      fullName: player?.full_name ?? "",
      birthDate: player?.birth_date ?? "",
      position: player?.position ?? "",
      jerseyNumber: player?.jersey_number ? String(player.jersey_number) : "",
      status: player?.status ?? "actif",
      emergencyContactName: player?.emergency_contact_name ?? "",
      emergencyContactPhone: player?.emergency_contact_phone ?? "",
      medicalNotes: player?.medical_notes ?? "",
    },
  });

  const status = watch("status");

  const onSubmit = (values: PlayerInput) => {
    setServerError(null);
    const formData = new FormData();
    formData.set("fullName", values.fullName);
    formData.set("birthDate", values.birthDate ?? "");
    formData.set("position", values.position ?? "");
    formData.set("jerseyNumber", values.jerseyNumber ?? "");
    formData.set("status", values.status);
    formData.set("emergencyContactName", values.emergencyContactName ?? "");
    formData.set("emergencyContactPhone", values.emergencyContactPhone ?? "");
    formData.set("medicalNotes", values.medicalNotes ?? "");

    startTransition(async () => {
      const result =
        mode === "edit" && player
          ? await updatePlayer(player.id, teamId, {}, formData)
          : await createPlayer(teamId, {}, formData);

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
            Ajouter un joueur
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Modifier le joueur">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Ajouter un joueur" : "Modifier le joueur"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input id="birthDate" type="date" {...register("birthDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jerseyNumber">Numéro</Label>
              <Input id="jerseyNumber" type="number" min={1} max={99} {...register("jerseyNumber")} />
              {errors.jerseyNumber && (
                <p className="text-sm text-destructive">{errors.jerseyNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="position">Poste</Label>
              <Input id="position" placeholder="Attaquant, Défenseur..." {...register("position")} />
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={status}
                onValueChange={(v) => setValue("status", v as PlayerInput["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact d&apos;urgence</Label>
              <Input id="emergencyContactName" placeholder="Nom" {...register("emergencyContactName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Téléphone d&apos;urgence</Label>
              <Input id="emergencyContactPhone" {...register("emergencyContactPhone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalNotes">Notes médicales (allergies, traitements...)</Label>
            <Textarea id="medicalNotes" rows={2} {...register("medicalNotes")} />
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
