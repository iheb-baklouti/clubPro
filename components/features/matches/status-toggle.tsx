"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatusToggleProps<T extends string> {
  value: T | null;
  options: { value: T; label: string; activeClassName: string }[];
  onSelect: (value: T) => Promise<{ error?: string } | void>;
}

export function StatusToggle<T extends string>({ value, options, onSelect }: StatusToggleProps<T>) {
  const [optimisticValue, setOptimisticValue] = useState(value);
  const [pendingValue, setPendingValue] = useState<T | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <div className="inline-flex overflow-hidden rounded-md border">
        {options.map((option) => {
          const isActive = optimisticValue === option.value;
          const isThisPending = isPending && pendingValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={isPending}
              onClick={() => {
                setError(null);
                setPendingValue(option.value);
                startTransition(async () => {
                  const result = await onSelect(option.value);
                  if (result?.error) {
                    setError(result.error);
                  } else {
                    setOptimisticValue(option.value);
                  }
                });
              }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed",
                isActive ? option.activeClassName : "bg-background text-muted-foreground hover:bg-accent",
              )}
            >
              {isThisPending && <Loader2 className="h-3 w-3 animate-spin" />}
              {option.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
