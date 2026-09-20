import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayerContext } from "@/lib/supabase/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateOnly } from "@/lib/format";

export default async function JoueurTachesPage() {
  const ctx = await getCurrentPlayerContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, due_date, status")
    .eq("assigned_player_id", ctx.playerId)
    .order("due_date", { ascending: true, nullsFirst: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes tâches</h1>
        <p className="text-muted-foreground">Assignations bénévoles qui te concernent.</p>
      </div>

      {!tasks || tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <ClipboardList className="h-8 w-8" />
            <p>Aucune tâche ne t&apos;est assignée pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{task.title}</p>
                  {task.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                  )}
                  {task.due_date && (
                    <p className="text-sm text-muted-foreground">Échéance {formatDateOnly(task.due_date)}</p>
                  )}
                </div>
                <Badge variant={task.status === "fait" ? "secondary" : "outline"}>
                  {task.status === "fait" ? "Fait" : "À faire"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
