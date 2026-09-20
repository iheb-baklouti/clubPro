"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseCsv } from "@/lib/csv-import";
import { importPlayers, type ImportPlayerRow } from "@/app/(dashboard)/equipes/actions";

export function PlayerCsvImportDialog({ teamId }: { teamId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ImportPlayerRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    file.text().then((text) => {
      const lines = parseCsv(text);
      if (lines.length === 0) return;

      // En-tête optionnel : si la première cellule ressemble à un libellé,
      // on saute la ligne.
      const header = lines[0]!.map((c) => c.toLowerCase());
      const startIndex = header[0]?.includes("nom") ? 1 : 0;

      const parsed: ImportPlayerRow[] = lines.slice(startIndex).map((cells) => ({
        fullName: cells[0] ?? "",
        jerseyNumber: cells[1] ? Number(cells[1]) || null : null,
        position: cells[2] || null,
        birthDate: cells[3] || null,
      }));

      setRows(parsed.filter((r) => r.fullName));
    });
  }

  function handleImport() {
    startTransition(async () => {
      const result = await importPlayers(teamId, rows);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setRows([]);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Upload className="h-4 w-4" />
          Importer un fichier CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importer des joueurs</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Fichier CSV avec les colonnes : Nom, Numéro, Poste, Date de naissance (les trois
          dernières sont optionnelles). Une ligne d&apos;en-tête est détectée automatiquement.
        </p>

        <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          Choisir un fichier
        </Button>

        {rows.length > 0 && (
          <div className="max-h-64 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>N°</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Naissance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.fullName}</TableCell>
                    <TableCell>{row.jerseyNumber ?? "—"}</TableCell>
                    <TableCell>{row.position ?? "—"}</TableCell>
                    <TableCell>{row.birthDate ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleImport} disabled={isPending || rows.length === 0}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importer {rows.length > 0 ? `(${rows.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
