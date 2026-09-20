interface IcsMatch {
  id: string;
  opponent_name: string;
  match_date: string;
  location: string | null;
  competition_type: string | null;
  home_or_away: "domicile" | "exterieur";
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsDate(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/** Génère un flux iCalendar (.ics) pour les matchs d'une équipe, importable dans Google Calendar/Outlook. */
export function buildMatchesIcs(teamName: string, matches: IcsMatch[]): string {
  const now = toIcsDate(new Date().toISOString());

  const events = matches.map((match) => {
    const start = toIcsDate(match.match_date);
    const end = toIcsDate(new Date(new Date(match.match_date).getTime() + 2 * 60 * 60 * 1000).toISOString());
    const summary = `${match.home_or_away === "domicile" ? "vs" : "@"} ${match.opponent_name} (${teamName})`;
    const descriptionParts = [match.competition_type, match.location].filter(Boolean);

    return [
      "BEGIN:VEVENT",
      `UID:clubpro-match-${match.id}@clubpro`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      match.location ? `LOCATION:${escapeIcsText(match.location)}` : "",
      descriptionParts.length ? `DESCRIPTION:${escapeIcsText(descriptionParts.join(" — "))}` : "",
      "END:VEVENT",
    ]
      .filter(Boolean)
      .join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClubPro//FR",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcsText(`ClubPro — ${teamName}`)}`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");
}
