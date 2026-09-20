"use client";

import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MatchReportData } from "@/lib/pdf-reports";

export function ExportMatchPdfButton({ data }: { data: MatchReportData }) {
  async function handleExport() {
    // jsPDF est chargé à la demande : il ne doit pas alourdir le bundle de
    // la page pour une action déclenchée par un seul clic occasionnel.
    const { generateMatchReportPdf } = await import("@/lib/pdf-reports");
    generateMatchReportPdf(data);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      <FileText className="h-4 w-4" />
      Feuille de match (PDF)
    </Button>
  );
}
