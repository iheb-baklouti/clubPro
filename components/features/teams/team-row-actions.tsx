"use client";

import { useRouter } from "next/navigation";

import { TeamFormDialog } from "@/components/features/teams/team-form-dialog";
import { ConfirmDeleteButton } from "@/components/features/confirm-delete-button";
import { deleteTeam } from "@/app/(dashboard)/equipes/actions";

export function TeamRowActions({
  team,
}: {
  team: { id: string; name: string; category: string };
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      <TeamFormDialog mode="edit" team={team} />
      <ConfirmDeleteButton
        label="Supprimer l'équipe"
        onConfirm={async () => {
          const result = await deleteTeam(team.id);
          if (!result?.error) router.push("/equipes");
          return result;
        }}
      />
    </div>
  );
}
