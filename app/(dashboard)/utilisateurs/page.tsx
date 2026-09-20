import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InviteMemberDialog } from "@/components/features/users/invite-member-dialog";
import { MemberRoleSelect, RevokeMemberButton } from "@/components/features/users/member-row-actions";

export default async function UtilisateursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isManager = currentProfile?.role === "direction" || currentProfile?.role === "admin";
  if (!isManager) redirect("/");

  const [{ data: members }, { data: allPlayers }, { data: linkedProfiles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("players")
      .select("id, full_name, jersey_number, teams(name)")
      .order("full_name"),
    supabase.from("profiles").select("player_id").not("player_id", "is", null),
  ]);

  const linkedPlayerIds = new Set(linkedProfiles?.map((p) => p.player_id));
  const availablePlayers = (allPlayers ?? []).filter((p) => !linkedPlayerIds.has(p.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs &amp; rôles</h1>
          <p className="text-muted-foreground">Membres du staff ayant accès au club.</p>
        </div>
        <InviteMemberDialog availablePlayers={availablePlayers} />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.full_name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{member.email ?? "—"}</TableCell>
                <TableCell>
                  <MemberRoleSelect
                    profileId={member.id}
                    role={member.role}
                    isSelf={member.id === user.id}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <RevokeMemberButton profileId={member.id} isSelf={member.id === user.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
