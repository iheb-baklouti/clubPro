/** Dimensions du terrain 3D (unités arbitraires, ratio ~68x105 d'un vrai terrain). */
export const PITCH_WIDTH = 60;
export const PITCH_DEPTH = 100;

/** Convertit les coordonnées pourcentage (0-100, comme dans FormationData) en position 3D au sol. */
export function percentToWorld(x: number, y: number): [number, number, number] {
  const worldX = (x / 100 - 0.5) * PITCH_WIDTH;
  const worldZ = (y / 100 - 0.5) * PITCH_DEPTH;
  return [worldX, 0, worldZ];
}

/** Convertit une position monde (sol, y=0) en coordonnées pourcentage, bornées 0-100. */
export function worldToPercent(worldX: number, worldZ: number): { x: number; y: number } {
  const x = (worldX / PITCH_WIDTH + 0.5) * 100;
  const y = (worldZ / PITCH_DEPTH + 0.5) * 100;
  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
