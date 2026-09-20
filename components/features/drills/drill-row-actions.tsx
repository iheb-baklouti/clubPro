"use client";

import { DrillFormDialog } from "@/components/features/drills/drill-form-dialog";
import { ConfirmDeleteButton } from "@/components/features/confirm-delete-button";
import { deleteDrill } from "@/app/(dashboard)/drills/actions";
import type { DrillInput } from "@/lib/validations/trainings";

interface Drill {
  id: string;
  title: string;
  category: DrillInput["category"];
  description: string | null;
  diagram_url: string | null;
}

export function DrillRowActions({ drill }: { drill: Drill }) {
  return (
    <div className="flex items-center gap-1">
      <DrillFormDialog mode="edit" drill={drill} />
      <ConfirmDeleteButton label="Supprimer l'exercice" onConfirm={() => deleteDrill(drill.id)} />
    </div>
  );
}
