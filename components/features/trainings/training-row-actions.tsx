"use client";

import { useRouter } from "next/navigation";

import { TrainingFormDialog } from "@/components/features/trainings/training-form-dialog";
import { ConfirmDeleteButton } from "@/components/features/confirm-delete-button";
import { deleteTraining } from "@/app/(dashboard)/entrainements/actions";
import type { TrainingInput } from "@/lib/validations/trainings";

export function TrainingRowActions({
  training,
  teams,
}: {
  training: {
    id: string;
    team_id: string;
    date: string;
    type: TrainingInput["type"];
    description: string | null;
  };
  teams: { id: string; name: string }[];
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      <TrainingFormDialog mode="edit" teams={teams} training={training} />
      <ConfirmDeleteButton
        label="Supprimer la séance"
        onConfirm={async () => {
          const result = await deleteTraining(training.id);
          if (!result?.error) router.push("/entrainements");
          return result;
        }}
      />
    </div>
  );
}
