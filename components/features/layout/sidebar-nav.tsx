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
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
