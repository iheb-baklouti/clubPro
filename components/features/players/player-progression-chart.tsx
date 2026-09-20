"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import type { ProgressionPoint } from "@/lib/player-stats";

// Paire catégorielle validée (slots 1-2 du thème par défaut du skill dataviz) :
// Delta E CVD adjacent 9.1 (>= 8 cible), normal-vision 19.6 (>= 15 plancher).
const GOALS_COLOR = "#2a78d6";
const ASSISTS_COLOR = "#eb6834";

export function PlayerProgressionChart({ data }: { data: ProgressionPoint[] }) {
  if (data.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Pas assez de matchs joués pour afficher une progression.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="matchLabel"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              fontSize: 12,
            }}
            labelFormatter={(label) => `vs ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            name="Buts (cumulé)"
            dataKey="cumulativeGoals"
            stroke={GOALS_COLOR}
            strokeWidth={2}
            dot={{ r: 4, fill: GOALS_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            name="Passes D. (cumulé)"
            dataKey="cumulativeAssists"
            stroke={ASSISTS_COLOR}
            strokeWidth={2}
            dot={{ r: 4, fill: ASSISTS_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
