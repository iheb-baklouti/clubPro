import { jsPDF } from "jspdf";

const MARGIN = 14;
const LINE_HEIGHT = 6;
const PAGE_BOTTOM = 280;

function drawTable(
  doc: jsPDF,
  startY: number,
  headers: string[],
  rows: (string | number)[][],
  colWidths: number[],
) {
  let y = startY;

  function drawHeader() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    let x = MARGIN;
    headers.forEach((h, i) => {
      doc.text(h, x, y);
      x += colWidths[i]!;
    });
    y += 2;
    doc.setDrawColor(200);
    doc.line(
      MARGIN,
      y,
      MARGIN + colWidths.reduce((a, b) => a + b, 0),
      y,
    );
    y += LINE_HEIGHT;
    doc.setFont("helvetica", "normal");
  }

  drawHeader();
  for (const row of rows) {
    if (y > PAGE_BOTTOM) {
      doc.addPage();
      y = MARGIN;
      drawHeader();
    }
    let x = MARGIN;
    row.forEach((cell, i) => {
      doc.text(String(cell), x, y);
      x += colWidths[i]!;
    });
    y += LINE_HEIGHT;
  }
  return y;
}

function header(doc: jsPDF, title: string, subtitle: string, detail?: string) {
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(title, MARGIN, 18);
  doc.setFontSize(11);
  doc.text(subtitle, MARGIN, 28);
  if (detail) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(detail, MARGIN, 35);
    doc.setTextColor(0);
  }
}

const CALL_UP_LABEL: Record<string, string> = {
  convoque: "Convoqué",
  absent: "Absent",
  blesse: "Blessé",
};

export interface MatchReportData {
  teamName: string;
  opponentName: string;
  homeOrAway: "domicile" | "exterieur";
  dateLabel: string;
  location: string | null;
  competitionType: string | null;
  status: "a_venir" | "joue";
  scoreHome: number | null;
  scoreAway: number | null;
  players: { id: string; full_name: string; jersey_number: number | null }[];
  callUps: { player_id: string; status: string }[];
  stats: { player_id: string; goals: number; assists: number; yellow_cards: number; red_cards: number; minutes_played: number }[];
}

export function generateMatchReportPdf(data: MatchReportData) {
  const doc = new jsPDF();
  const opponentLine = `${data.teamName} ${data.homeOrAway === "domicile" ? "vs" : "@"} ${data.opponentName}`;
  const detailParts = [data.dateLabel, data.location, data.competitionType].filter(Boolean);
  const callUpByPlayer = new Map(data.callUps.map((c) => [c.player_id, c.status]));
  const statByPlayer = new Map(data.stats.map((s) => [s.player_id, s]));

  header(doc, "Feuille de match", opponentLine, detailParts.join(" · "));

  let y = 45;
  if (data.status === "joue") {
    doc.setFontSize(12);
    doc.text(`Score : ${data.scoreHome ?? "–"} : ${data.scoreAway ?? "–"}`, MARGIN, y);
    y += 10;
  }

  doc.setFontSize(12);
  doc.text("Convocations", MARGIN, y);
  y += 8;
  y = drawTable(
    doc,
    y,
    ["Joueur", "N°", "Statut"],
    data.players.map((p) => [
      p.full_name,
      p.jersey_number ?? "–",
      CALL_UP_LABEL[callUpByPlayer.get(p.id) ?? ""] ?? "Non convoqué",
    ]),
    [100, 20, 50],
  );

  if (data.status === "joue") {
    y += 10;
    if (y > PAGE_BOTTOM) {
      doc.addPage();
      y = MARGIN;
    }
    doc.setFontSize(12);
    doc.text("Statistiques", MARGIN, y);
    y += 8;
    drawTable(
      doc,
      y,
      ["Joueur", "Buts", "Passes D.", "CJ", "CR", "Minutes"],
      data.players.map((p) => {
        const s = statByPlayer.get(p.id);
        return [p.full_name, s?.goals ?? 0, s?.assists ?? 0, s?.yellow_cards ?? 0, s?.red_cards ?? 0, s?.minutes_played ?? 0];
      }),
      [70, 20, 25, 15, 15, 20],
    );
  }

  doc.save(`feuille-de-match-${data.opponentName.replace(/\s+/g, "-")}.pdf`);
}

export interface PlayerReportData {
  fullName: string;
  position: string | null;
  jerseyNumber: number | null;
  totals: { matches: number; goals: number; assists: number; yellowCards: number; redCards: number; minutesPlayed: number };
  matchRows: { match: string; goals: number; assists: number; yellow_cards: number; red_cards: number; minutes_played: number }[];
}

export function generatePlayerReportPdf(data: PlayerReportData) {
  const doc = new jsPDF();
  const subtitle = [data.position, data.jerseyNumber ? `N°${data.jerseyNumber}` : null].filter(Boolean).join(" · ");

  header(doc, "Rapport joueur", data.fullName, subtitle || undefined);

  let y = 45;
  doc.setFontSize(12);
  doc.text("Totaux de la saison", MARGIN, y);
  y += 8;
  y = drawTable(
    doc,
    y,
    ["Matchs", "Buts", "Passes D.", "CJ", "CR", "Minutes"],
    [[
      data.totals.matches,
      data.totals.goals,
      data.totals.assists,
      data.totals.yellowCards,
      data.totals.redCards,
      data.totals.minutesPlayed,
    ]],
    [25, 20, 25, 15, 15, 20],
  );

  y += 10;
  doc.setFontSize(12);
  doc.text("Détail par match", MARGIN, y);
  y += 8;
  drawTable(
    doc,
    y,
    ["Match", "Buts", "Passes D.", "CJ", "CR", "Minutes"],
    data.matchRows.map((r) => [r.match, r.goals, r.assists, r.yellow_cards, r.red_cards, r.minutes_played]),
    [70, 20, 25, 15, 15, 20],
  );

  doc.save(`rapport-${data.fullName.replace(/\s+/g, "-")}.pdf`);
}
