export interface FormationSlot {
  id: string;
  label: string;
  x: number;
  y: number;
  playerId: string | null;
}

export interface FormationArrow {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface BallPosition {
  x: number;
  y: number;
}

export interface FormationData {
  formationType: string;
  slots: FormationSlot[];
  arrows: FormationArrow[];
  ball?: BallPosition;
}

type TemplateSlot = Omit<FormationSlot, "playerId">;

/** Bibliothèque de formations prédéfinies — points de départ pour l'éditeur (item 12). */
export const FORMATION_TEMPLATES: Record<string, TemplateSlot[]> = {
  "4-4-2": [
    { id: "gk", label: "GB", x: 50, y: 90 },
    { id: "dl", label: "DG", x: 15, y: 72 },
    { id: "dcl", label: "DC", x: 38, y: 75 },
    { id: "dcr", label: "DC", x: 62, y: 75 },
    { id: "dr", label: "DD", x: 85, y: 72 },
    { id: "ml", label: "MG", x: 15, y: 48 },
    { id: "mcl", label: "MC", x: 38, y: 50 },
    { id: "mcr", label: "MC", x: 62, y: 50 },
    { id: "mr", label: "MD", x: 85, y: 48 },
    { id: "st1", label: "BU", x: 40, y: 20 },
    { id: "st2", label: "BU", x: 60, y: 20 },
  ],
  "4-3-3": [
    { id: "gk", label: "GB", x: 50, y: 90 },
    { id: "dl", label: "DG", x: 15, y: 72 },
    { id: "dcl", label: "DC", x: 35, y: 75 },
    { id: "dcr", label: "DC", x: 65, y: 75 },
    { id: "dr", label: "DD", x: 85, y: 72 },
    { id: "mcl", label: "MC", x: 30, y: 50 },
    { id: "mc", label: "MC", x: 50, y: 52 },
    { id: "mcr", label: "MC", x: 70, y: 50 },
    { id: "lw", label: "AG", x: 20, y: 22 },
    { id: "st", label: "BU", x: 50, y: 15 },
    { id: "rw", label: "AD", x: 80, y: 22 },
  ],
  "3-5-2": [
    { id: "gk", label: "GB", x: 50, y: 90 },
    { id: "dcl", label: "DC", x: 30, y: 75 },
    { id: "dc", label: "DC", x: 50, y: 78 },
    { id: "dcr", label: "DC", x: 70, y: 75 },
    { id: "ml", label: "MG", x: 12, y: 50 },
    { id: "mcl", label: "MC", x: 33, y: 52 },
    { id: "mc", label: "MC", x: 50, y: 55 },
    { id: "mcr", label: "MC", x: 67, y: 52 },
    { id: "mr", label: "MD", x: 88, y: 50 },
    { id: "st1", label: "BU", x: 40, y: 20 },
    { id: "st2", label: "BU", x: 60, y: 20 },
  ],
  "4-2-3-1": [
    { id: "gk", label: "GB", x: 50, y: 90 },
    { id: "dl", label: "DG", x: 15, y: 72 },
    { id: "dcl", label: "DC", x: 38, y: 75 },
    { id: "dcr", label: "DC", x: 62, y: 75 },
    { id: "dr", label: "DD", x: 85, y: 72 },
    { id: "dml", label: "MDF", x: 38, y: 58 },
    { id: "dmr", label: "MDF", x: 62, y: 58 },
    { id: "aml", label: "MOG", x: 18, y: 35 },
    { id: "amc", label: "MOC", x: 50, y: 32 },
    { id: "amr", label: "MOD", x: 82, y: 35 },
    { id: "st", label: "BU", x: 50, y: 15 },
  ],
  "5-3-2": [
    { id: "gk", label: "GB", x: 50, y: 90 },
    { id: "dl", label: "DG", x: 8, y: 72 },
    { id: "dcl", label: "DC", x: 30, y: 76 },
    { id: "dc", label: "DC", x: 50, y: 78 },
    { id: "dcr", label: "DC", x: 70, y: 76 },
    { id: "dr", label: "DD", x: 92, y: 72 },
    { id: "mcl", label: "MC", x: 30, y: 50 },
    { id: "mc", label: "MC", x: 50, y: 52 },
    { id: "mcr", label: "MC", x: 70, y: 50 },
    { id: "st1", label: "BU", x: 40, y: 20 },
    { id: "st2", label: "BU", x: 60, y: 20 },
  ],
};

export const FORMATION_TYPES = Object.keys(FORMATION_TEMPLATES);

const KICKOFF_BALL: BallPosition = { x: 50, y: 50 };

export function createFormationFromTemplate(formationType: string): FormationData {
  const template = FORMATION_TEMPLATES[formationType] ?? FORMATION_TEMPLATES["4-4-2"]!;
  return {
    formationType,
    slots: template.map((slot) => ({ ...slot, playerId: null })),
    arrows: [],
    ball: KICKOFF_BALL,
  };
}

/**
 * Change de gabarit de formation en conservant les joueurs déjà assignés,
 * dans leur ordre courant (le gardien reste en premier, chaque gabarit
 * commençant par "gk") — heuristique simple plutôt qu'un vrai appariement
 * sémantique poste par poste.
 */
export function remapFormationToTemplate(current: FormationData, newType: string): FormationData {
  const template = FORMATION_TEMPLATES[newType] ?? FORMATION_TEMPLATES["4-4-2"]!;
  const assignedPlayerIds = current.slots
    .filter((s) => s.playerId !== null)
    .map((s) => s.playerId as string);

  return {
    formationType: newType,
    slots: template.map((slot, index) => ({
      ...slot,
      playerId: assignedPlayerIds[index] ?? null,
    })),
    arrows: current.arrows,
    ball: current.ball ?? KICKOFF_BALL,
  };
}

/**
 * Interpole linéairement les positions (joueurs assignés à un slot présent
 * dans les deux instantanés, plus le ballon) entre deux instantanés. Les
 * flèches ne sont pas interpolées (affichées seulement à l'instantané exact).
 * Ceci anime une transition entre deux états créés manuellement par le staff
 * — ce n'est pas un replay de mouvements réellement captés.
 */
export function interpolateFormations(a: FormationData, b: FormationData, t: number): FormationData {
  const clampedT = Math.min(1, Math.max(0, t));
  const bSlotsById = new Map(b.slots.map((s) => [s.id, s]));

  const slots = a.slots.map((slotA) => {
    const slotB = bSlotsById.get(slotA.id);
    if (!slotB) return slotA;
    return {
      ...slotA,
      x: slotA.x + (slotB.x - slotA.x) * clampedT,
      y: slotA.y + (slotB.y - slotA.y) * clampedT,
      playerId: clampedT < 0.5 ? slotA.playerId : slotB.playerId,
    };
  });

  const ball =
    a.ball && b.ball
      ? {
          x: a.ball.x + (b.ball.x - a.ball.x) * clampedT,
          y: a.ball.y + (b.ball.y - a.ball.y) * clampedT,
        }
      : (clampedT < 0.5 ? a.ball : b.ball);

  return {
    formationType: clampedT < 0.5 ? a.formationType : b.formationType,
    slots,
    arrows: clampedT < 0.5 ? a.arrows : b.arrows,
    ball,
  };
}

export function isFormationData(value: unknown): value is FormationData {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as FormationData).slots) &&
    Array.isArray((value as FormationData).arrows)
  );
}
