"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerRadarChart } from "@/components/features/players/player-radar-chart";
import { getPlayerPanelData, type PlayerPanelData } from "@/app/(dashboard)/calendrier/player-panel-actions";

const STATUS_LABEL = { actif: "Actif", blesse: "Blessé", suspendu: "Suspendu" } as const;

export function PlayerStatsPanel({ playerId }: { playerId: string }) {
  const [data, setData] = useState<PlayerPanelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPlayerPanelData(playerId).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Joueur introuvable.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{data.player.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {data.player.position ?? "Poste non renseigné"}
              {data.player.jersey_number ? ` · N°${data.player.jersey_number}` : ""}
            </p>
          </div>
          <Badge variant={data.player.status === "actif" ? "default" : "destructive"}>
            {STATUS_LABEL[data.player.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Matchs", value: data.totals.matches },
            { label: "Buts", value: data.totals.goals },
            { label: "Passes D.", value: data.totals.assists },
          ].map((stat) => (
            <div key={stat.label} className="rounded-md bg-muted/50 p-2">
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {data.totals.matches > 0 && <PlayerRadarChart data={data.radarData} />}
      </CardContent>
    </Card>
  );
}
