export interface CsvColumn<T> {
  key: keyof T;
  label: string;
}

function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvCell(row[c.key])).join(","));
  // BOM pour qu'Excel détecte l'UTF-8 (accents) sans reconfiguration manuelle.
  return "﻿" + [header, ...lines].join("\r\n");
}
