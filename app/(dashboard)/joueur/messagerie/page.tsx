import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentPlayerContext } from "@/lib/supabase/session";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageComposer } from "@/components/features/messages/message-composer";

export default async function JoueurMessageriePage() {
  const ctx = await getCurrentPlayerContext();
  if (!ctx) redirect("/login");

  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, created_at, team_id, sender:profiles(full_name)")
    .or(`team_id.is.null,team_id.eq.${ctx.teamId}`)
    .order("created_at", { ascending: true })
    .limit(200);

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messagerie</h1>
        <p className="text-muted-foreground">
          Messages du club et de ton équipe — tu peux répondre à ton équipe.
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {!messages || messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8" />
              <p>Aucun message pour le moment.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {message.sender?.full_name ?? "Utilisateur"}
                    {!message.team_id && (
                      <Badge variant="outline" className="text-[10px]">
                        Club
                      </Badge>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            ))
          )}
        </CardContent>
        <div className="border-t p-3">
          <MessageComposer teamId={ctx.teamId} />
        </div>
      </Card>
    </div>
  );
}
