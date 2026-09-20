"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, Library, Loader2, Save, Trash2 } from "lucide-react";

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
import {
  listFormationTemplates,
  saveFormationTemplate,
  duplicateFormationTemplate,
  deleteFormationTemplate,
  type FormationTemplateSummary,
} from "@/app/(dashboard)/calendrier/formation-library-actions";
import { isFormationData, type FormationData } from "@/lib/formations";

export function FormationLibraryDialog({
  currentFormation,
  onLoad,
}: {
  currentFormation: FormationData;
  onLoad: (data: FormationData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<FormationTemplateSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveNotes, setSaveNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    listFormationTemplates().then((data) => {
      setTemplates(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Library className="h-4 w-4" />
          Bibliothèque
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bibliothèque de formations</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 rounded-md border p-3">
          <p className="text-sm font-medium">Enregistrer la formation actuelle</p>
          <Input
            placeholder="Nom (ex: Pressing haut 4-3-3)"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
          />
          <Input
            placeholder="Notes (optionnel)"
            value={saveNotes}
            onChange={(e) => setSaveNotes(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            disabled={isPending || !saveName.trim()}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await saveFormationTemplate(
                  saveName,
                  saveNotes,
                  null,
                  currentFormation,
                );
                if (result?.error) setError(result.error);
                else {
                  setSaveName("");
                  setSaveNotes("");
                  refresh();
                }
              })
            }
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer dans la bibliothèque
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Aucun modèle enregistré pour le moment.
            </p>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between gap-2 rounded-md border p-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.formation_type}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (isFormationData(template.positions_json)) {
                        onLoad(template.positions_json);
                        setOpen(false);
                      }
                    }}
                  >
                    Charger
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Dupliquer"
                    onClick={() =>
                      startTransition(async () => {
                        await duplicateFormationTemplate(template.id);
                        refresh();
                      })
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer"
                    onClick={() =>
                      startTransition(async () => {
                        await deleteFormationTemplate(template.id);
                        refresh();
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
