"use client";

import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PlayerReportData } from "@/lib/pdf-reports";

export function ExportPlayerPdfButton({ data }: { data: PlayerReportData }) {
  async function handleExport() {
    const { generatePlayerReportPdf } = await import("@/lib/pdf-reports");
    generatePlayerReportPdf(data);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport}>
      <FileText className="h-4 w-4" />
      Rapport (PDF)
    </Button>
  );
}
