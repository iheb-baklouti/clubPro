"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { getNavItems } from "@/lib/nav-items";
import type { UserRole } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function SidebarNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = getNavItems(role);

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = item.href ? pathname === item.href : false;
        const Icon = item.icon;

        if (!item.href) {
          return (
            <div
              key={item.label}
              className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground/50"
              aria-disabled
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground/50">
                Bientôt
              </Badge>
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {isActive && (
              <span className="absolute inset-y-1 left-0 w-1 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
            )}
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
