import type { SeasonRecord } from "@/lib/season-record";

export function SeasonRecordStrip({ record }: { record: SeasonRecord }) {
  if (record.played === 0) return null;

  const items = [
    { label: "Matchs", value: record.played },
    { label: "Victoires", value: record.wins, className: "text-primary" },
    { label: "Nuls", value: record.draws },
    { label: "Défaites", value: record.losses, className: "text-destructive" },
    { label: "Buts marqués", value: record.goalsFor },
    { label: "Buts encaissés", value: record.goalsAgainst },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border bg-card p-3 text-center">
          <p className={`text-xl font-bold ${item.className ?? ""}`}>{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
