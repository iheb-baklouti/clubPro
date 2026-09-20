import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlayerFormDialog } from "@/components/features/players/player-form-dialog";
import { PlayerRowActions } from "@/components/features/players/player-row-actions";
import { PlayerAvatar } from "@/components/features/players/player-avatar";
import { TeamRowActions } from "@/components/features/teams/team-row-actions";
import { ExportCsvButton } from "@/components/features/shared/export-csv-button";

const STATUS_VARIANT = {
  actif: "default",
  blesse: "destructive",
  suspendu: "secondary",
} as const;

const STATUS_LABEL = {
  actif: "Actif",
  blesse: "Blessé",
  suspendu: "Suspendu",
} as const;

export default async function TeamRosterPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, category")
    .eq("id", teamId)
    .single();

  if (!team) notFound();

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .order("jersey_number", { ascending: true, nullsFirst: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/equipes" className="text-sm text-muted-foreground hover:underline">
            &larr; Toutes les équipes
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
            <TeamRowActions team={team} />
          </div>
          <p className="text-muted-foreground">{team.category}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCsvButton
            rows={players ?? []}
            filename={`effectif-${team.name}`}
            columns={[
              { key: "jersey_number", label: "Numéro" },
              { key: "full_name", label: "Nom" },
              { key: "position", label: "Poste" },
              { key: "status", label: "Statut" },
              { key: "birth_date", label: "Date de naissance" },
            ]}
          />
          <PlayerFormDialog mode="create" teamId={team.id} />
        </div>
      </div>

      {!players || players.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <Users className="h-8 w-8" />
            <p>Aucun joueur dans cette équipe pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="text-muted-foreground">
                    {player.jersey_number ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/equipes/${team.id}/joueurs/${player.id}`}
                      className="flex items-center gap-3 font-medium hover:underline"
                    >
                      <PlayerAvatar
                        playerId={player.id}
                        fullName={player.full_name}
                        photoUrl={player.photo_url}
                      />
                      {player.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{player.position ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[player.status]}>
                      {STATUS_LABEL[player.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <PlayerRowActions player={player} teamId={team.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
