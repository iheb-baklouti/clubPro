"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/app/(dashboard)/messagerie/actions";

export function MessageComposer({ teamId }: { teamId: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await sendMessage(teamId, {}, formData);
          if (result?.error) setError(result.error);
          else formRef.current?.reset();
        });
      }}
    >
      <Input name="content" placeholder="Écrire un message..." autoComplete="off" />
      <Button type="submit" size="icon" disabled={isPending} aria-label="Envoyer">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
