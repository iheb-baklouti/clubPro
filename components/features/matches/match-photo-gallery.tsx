"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, Images, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { addMatchPhoto, deleteMatchPhoto } from "@/app/(dashboard)/calendrier/photo-actions";

interface Photo {
  id: string;
  storagePath: string;
  caption: string | null;
}

function publicUrl(storagePath: string) {
  const supabase = createClient();
  return supabase.storage.from("match-photos").getPublicUrl(storagePath).data.publicUrl;
}

export function MatchPhotoGallery({ matchId, photos }: { matchId: string; photos: Photo[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const extension = file.name.split(".").pop() ?? "jpg";
        const path = `${matchId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("match-photos").upload(path, file);
        if (uploadError) {
          setError("Échec de l'envoi : " + uploadError.message);
          continue;
        }
        const result = await addMatchPhoto(matchId, path, "");
        if (result?.error) setError(result.error);
      }
      router.refresh();
    });
  }

  function handleDelete(photoId: string) {
    startTransition(async () => {
      await deleteMatchPhoto(photoId, matchId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
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
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        Ajouter des photos
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}

      {photos.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Images className="h-4 w-4" />
          Aucune photo pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-md bg-muted">
              <Image
                src={publicUrl(photo.storagePath)}
                alt={photo.caption ?? "Photo du match"}
                fill
                sizes="150px"
                className="object-cover"
              />
              <button
                type="button"
                aria-label="Supprimer la photo"
                onClick={() => handleDelete(photo.id)}
                className="absolute right-1 top-1 rounded-md bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
