import { ClipboardList } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskFormDialog } from "@/components/features/tasks/task-form-dialog";
import { TaskRowActions, TaskStatusControl } from "@/components/features/tasks/task-row-actions";
import { formatDateOnly } from "@/lib/format";

export default async function TachesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: tasks }, { data: teams }, { data: staff }, { data: players }, { data: me }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*, teams(name), assigned_profile:profiles!tasks_assigned_profile_id_fkey(id, full_name), assigned_player:players(id, full_name)")
        .order("due_date", { ascending: true, nullsFirst: false }),
      supabase.from("teams").select("id, name").order("name"),
      supabase.from("profiles").select("id, full_name").order("full_name"),
      supabase.from("players").select("id, full_name").order("full_name"),
      supabase.from("profiles").select("role").eq("id", user?.id ?? "").single(),
    ]);

  const canDelete = me?.role === "direction" || me?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tâches</h1>
          <p className="text-muted-foreground">Assignations bénévoles : matériel, arbitrage, transport...</p>
        </div>
        <TaskFormDialog mode="create" teams={teams ?? []} staff={staff ?? []} players={players ?? []} />
      </div>

      {!tasks || tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <ClipboardList className="h-8 w-8" />
            <p>Aucune tâche pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{task.title}</p>
                    {task.teams?.name && <Badge variant="outline">{task.teams.name}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.assigned_profile?.full_name
                      ? `Assigné à ${task.assigned_profile.full_name}`
                      : task.assigned_player?.full_name
                        ? `Assigné à ${task.assigned_player.full_name}`
                        : "Non assigné"}
                    {task.due_date ? ` · Échéance ${formatDateOnly(task.due_date)}` : ""}
                  </p>
                  {task.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TaskStatusControl task={task} />
                  <TaskRowActions
                    task={task}
                    teams={teams ?? []}
                    staff={staff ?? []}
                    players={players ?? []}
                    canDelete={canDelete}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
