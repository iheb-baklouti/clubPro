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
import { drillSchema, type DrillInput } from "@/lib/validations/trainings";
import { createDrill, updateDrill } from "@/app/(dashboard)/drills/actions";

const CATEGORY_LABELS: Record<DrillInput["category"], string> = {
  physique: "Physique",
  technique: "Technique",
  tactique: "Tactique",
};

interface DrillFormDialogProps {
  mode: "create" | "edit";
  drill?: {
    id: string;
    title: string;
    category: DrillInput["category"];
    description: string | null;
    diagram_url: string | null;
  };
}

export function DrillFormDialog({ mode, drill }: DrillFormDialogProps) {
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
  } = useForm<DrillInput>({
    resolver: zodResolver(drillSchema),
    defaultValues: {
      title: drill?.title ?? "",
      category: drill?.category ?? "technique",
      description: drill?.description ?? "",
      diagramUrl: drill?.diagram_url ?? "",
    },
  });

  const category = watch("category");

  const onSubmit = (values: DrillInput) => {
    setServerError(null);
    const formData = new FormData();
    formData.set("title", values.title);
    formData.set("category", values.category);
    formData.set("description", values.description ?? "");
    formData.set("diagramUrl", values.diagramUrl ?? "");

    startTransition(async () => {
      const result =
        mode === "edit" && drill
          ? await updateDrill(drill.id, {}, formData)
          : await createDrill({}, formData);

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
            Nouvel exercice
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Modifier l'exercice">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nouvel exercice" : "Modifier l'exercice"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input id="title" placeholder="Rondo 5 contre 2" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select
              value={category}
              onValueChange={(v) => setValue("category", v as DrillInput["category"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Consignes, objectifs..."
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagramUrl">Schéma (URL, optionnel)</Label>
            <Input
              id="diagramUrl"
              placeholder="https://..."
              {...register("diagramUrl")}
            />
            {errors.diagramUrl && (
              <p className="text-sm text-destructive">{errors.diagramUrl.message}</p>
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
