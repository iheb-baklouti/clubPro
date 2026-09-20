"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateClubName } from "@/app/(dashboard)/club/actions";

export function ClubNameForm({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateClubName(name);
      if (result?.error) setError(result.error);
      else setSavedAt(Date.now());
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
      <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </Button>
      {savedAt && !error && <span className="text-sm text-muted-foreground">Enregistré.</span>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
