"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ConfirmDeleteButtonProps {
  onConfirm: () => Promise<{ error?: string } | void>;
  label?: string;
}

/** Bouton de suppression à double clic (armer puis confirmer), sans popup native. */
export function ConfirmDeleteButton({ onConfirm, label }: ConfirmDeleteButtonProps) {
  const [armed, setArmed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!armed) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={label ?? "Supprimer"}
          onClick={() => {
            setError(null);
            setArmed(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await onConfirm();
            if (result?.error) {
              // On reste en mode "armé" pour garder l'erreur visible au lieu
              // de revenir silencieusement à la simple icône poubelle.
              setError(result.error);
            } else {
              setArmed(false);
            }
          })
        }
      >
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        Confirmer
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setArmed(false);
          setError(null);
        }}
        disabled={isPending}
      >
        Annuler
      </Button>
    </div>
  );
}
