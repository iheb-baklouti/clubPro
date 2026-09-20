"use client";

import { useRouter } from "next/navigation";

import { MatchFormDialog } from "@/components/features/matches/match-form-dialog";
import { ConfirmDeleteButton } from "@/components/features/confirm-delete-button";
import { deleteMatch } from "@/app/(dashboard)/calendrier/actions";
import type { Database } from "@/lib/types/database.types";

type Match = Database["public"]["Tables"]["matches"]["Row"];

export function MatchRowActions({
  match,
  teams,
}: {
  match: Match;
  teams: { id: string; name: string }[];
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      <MatchFormDialog mode="edit" teams={teams} match={match} />
      <ConfirmDeleteButton
        label="Supprimer le match"
        onConfirm={async () => {
          const result = await deleteMatch(match.id);
          if (!result?.error) router.push("/calendrier");
          return result;
        }}
      />
    </div>
  );
}
