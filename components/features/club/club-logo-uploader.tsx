"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { updateClubLogo } from "@/app/(dashboard)/club/actions";
import { ClubLogo } from "@/components/features/layout/club-logo";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export function ClubLogoUploader({ clubId, currentLogoUrl }: { clubId: string; currentLogoUrl: string | null }) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Le logo doit être une image.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Le fichier dépasse 2 Mo.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const extension = file.name.split(".").pop() ?? "png";
      const path = `${clubId}/logo.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("club-logos")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

      if (uploadError) {
        setError("Échec de l'envoi : " + uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("club-logos").getPublicUrl(path);
      const bustedUrl = `${data.publicUrl}?t=${Date.now()}`;

      const result = await updateClubLogo(bustedUrl);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setLogoUrl(bustedUrl);
    });
  }

  return (
    <div className="flex items-center gap-4">
      <ClubLogo logoUrl={logoUrl} className="h-16 w-16" />
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {logoUrl ? "Changer le logo" : "Ajouter un logo"}
        </Button>
        <p className="text-xs text-muted-foreground">PNG ou JPG, 2 Mo maximum.</p>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
