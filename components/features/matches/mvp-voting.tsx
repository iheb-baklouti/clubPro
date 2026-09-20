"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trophy } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { voteMvp } from "@/app/(dashboard)/calendrier/mvp-actions";

interface Player {
  id: string;
  full_name: string;
  jersey_number: number | null;
}

export function MvpVoting({
  matchId,
  players,
  tally,
  myVote,
}: {
  matchId: string;
  players: Player[];
  tally: Map<string, number>;
  myVote: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const leaderId = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const leader = leaderId ? players.find((p) => p.id === leaderId) : null;
  const totalVotes = [...tally.values()].reduce((a, b) => a + b, 0);

  function handleVote(playerId: string) {
    startTransition(async () => {
      await voteMvp(matchId, playerId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {leader && (
        <p className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-accent-gold" />
          <span className="font-medium">{leader.full_name}</span>
          <span className="text-muted-foreground">
            en tête ({tally.get(leaderId!)} vote{(tally.get(leaderId!) ?? 0) > 1 ? "s" : ""} sur{" "}
            {totalVotes})
          </span>
        </p>
      )}
      <div className="flex items-center gap-2">
        <Select value={myVote ?? ""} onValueChange={handleVote} disabled={isPending}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Voter pour le MVP du match" />
          </SelectTrigger>
          <SelectContent>
            {players.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name}
                {p.jersey_number ? ` #${p.jersey_number}` : ""}
                {tally.get(p.id) ? ` — ${tally.get(p.id)} vote(s)` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      {myVote && (
        <p className="text-xs text-muted-foreground">
          Ton vote est enregistré, tu peux le changer à tout moment.
        </p>
      )}
    </div>
  );
}
