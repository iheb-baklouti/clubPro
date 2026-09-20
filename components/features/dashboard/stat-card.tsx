import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACCENT_CLASSES = {
  primary: "bg-primary/15 text-primary",
  gold: "bg-accent-gold/15 text-accent-gold",
  live: "bg-accent-live/15 text-accent-live",
  muted: "bg-muted text-muted-foreground",
} as const;

export function StatCard({
  href,
  icon: Icon,
  label,
  value,
  accent = "primary",
}: {
  href?: string;
  icon: LucideIcon;
  label: string;
  value: number | string;
  accent?: keyof typeof ACCENT_CLASSES;
}) {
  const content = (
    <Card className={cn("h-full transition-colors", href && "hover:bg-accent/40")}>
      <CardContent className="flex items-center gap-4 p-4">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            ACCENT_CLASSES[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1.5 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
