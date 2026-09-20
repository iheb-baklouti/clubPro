const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatMatchDate(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

const dateOnlyFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Formate une date sans heure (colonne `date`, ex: échéance de tâche). */
export function formatDateOnly(dateStr: string): string {
  return dateOnlyFormatter.format(new Date(`${dateStr}T00:00:00`));
}

/** Convertit un ISO (UTC) en valeur pour <input type="datetime-local"> dans le fuseau local. */
export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Convertit une valeur <input type="datetime-local"> (heure locale navigateur) en ISO UTC. */
export function fromDatetimeLocalValue(value: string): string {
  return new Date(value).toISOString();
}
