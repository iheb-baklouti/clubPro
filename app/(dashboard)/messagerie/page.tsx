import { MessageSquare } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { TeamFilterSelect } from "@/components/features/matches/team-filter-select";
import { MessageComposer } from "@/components/features/messages/message-composer";

export default async function MessageriePage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const { team: teamFilter } = await searchParams;
  const supabase = await createClient();

  let messagesQuery = supabase
    .from("messages")
    .select("id, content, created_at, sender:profiles(full_name)")
    .order("created_at", { ascending: true })
    .limit(200);

  messagesQuery = teamFilter
    ? messagesQuery.eq("team_id", teamFilter)
    : messagesQuery.is("team_id", null);

  const [{ data: teams }, { data: messages }] = await Promise.all([
    supabase.from("teams").select("id, name").order("name"),
    messagesQuery,
  ]);

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messagerie</h1>
        <p className="text-muted-foreground">
          Fil de discussion du club — remplace le groupe WhatsApp.
        </p>
      </div>

      <TeamFilterSelect teams={teams ?? []} />

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {!messages || messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <MessageSquare className="h-8 w-8" />
              <p>Aucun message pour le moment. Lancez la discussion !</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">
                    {message.sender?.full_name ?? "Utilisateur"}
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
          <MessageComposer teamId={teamFilter ?? null} />
        </div>
      </Card>
    </div>
  );
}
