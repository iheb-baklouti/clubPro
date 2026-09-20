"use client";

import { PlayerFormDialog } from "@/components/features/players/player-form-dialog";
import { ConfirmDeleteButton } from "@/components/features/confirm-delete-button";
import { deletePlayer } from "@/app/(dashboard)/equipes/actions";
import type { Database } from "@/lib/types/database.types";

type Player = Database["public"]["Tables"]["players"]["Row"];

export function PlayerRowActions({ player, teamId }: { player: Player; teamId: string }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <PlayerFormDialog mode="edit" teamId={teamId} player={player} />
      <ConfirmDeleteButton
        label="Supprimer le joueur"
        onConfirm={() => deletePlayer(player.id, teamId)}
      />
    </div>
  );
}
