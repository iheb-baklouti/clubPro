"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Building2, Loader2, Plus, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { addSponsor, deleteSponsor } from "@/app/(dashboard)/club/actions";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
}

export function SponsorsManager({ clubId, sponsors }: { clubId: string; sponsors: Sponsor[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    startTransition(async () => {
      const supabase = createClient();
      const extension = file.name.split(".").pop() ?? "png";
      const path = `${clubId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("sponsor-logos").upload(path, file);
      if (uploadError) {
        setError("Échec de l'envoi : " + uploadError.message);
        return;
      }
      const { data } = supabase.storage.from("sponsor-logos").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
    });
  }

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const result = await addSponsor(name, logoUrl ?? "", website);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setName("");
      setWebsite("");
      setLogoUrl(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSponsor(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" size="sm">
            <Plus className="h-4 w-4" />
            Ajouter un sponsor
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un sponsor</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="sponsor-name">Nom</Label>
              <Input id="sponsor-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sponsor-website">Site web (optionnel)</Label>
              <Input
                id="sponsor-website"
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Logo</Label>
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                    <Image src={logoUrl} alt="" fill sizes="40px" className="object-contain" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {logoUrl ? "Changer" : "Téléverser"}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={handleAdd} disabled={isPending || !name.trim()}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sponsors.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          Aucun sponsor pour le moment.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="flex items-center gap-2 rounded-md border p-2">
              {sponsor.logo_url ? (
                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded">
                  <Image src={sponsor.logo_url} alt={sponsor.name} fill sizes="32px" className="object-contain" />
                </div>
              ) : (
                <Building2 className="h-6 w-6 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{sponsor.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label="Supprimer"
                onClick={() => handleDelete(sponsor.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
