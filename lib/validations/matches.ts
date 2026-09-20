import { z } from "zod";

export const homeAwayValues = ["domicile", "exterieur"] as const;
export const matchStatusValues = ["a_venir", "joue"] as const;
export const callUpStatusValues = ["convoque", "absent", "blesse"] as const;
export const availabilityStatusValues = ["present", "absent", "incertain"] as const;

export type CallUpStatusValue = (typeof callUpStatusValues)[number];
export type AvailabilityStatusValue = (typeof availabilityStatusValues)[number];

export const matchSchema = z.object({
  teamId: z.string().uuid("Sélectionnez une équipe"),
  opponentName: z.string().min(1, "Le nom de l'adversaire est requis"),
  matchDate: z.string().min(1, "La date est requise"),
  location: z.string().optional().or(z.literal("")),
  competitionType: z.string().optional().or(z.literal("")),
  homeOrAway: z.enum(homeAwayValues).default("domicile"),
});

export type MatchInput = z.infer<typeof matchSchema>;

export const matchResultSchema = z.object({
  status: z.enum(matchStatusValues),
  scoreHome: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || Number(v) >= 0, { message: "Score invalide" }),
  scoreAway: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || Number(v) >= 0, { message: "Score invalide" }),
});

export type MatchResultInput = z.infer<typeof matchResultSchema>;

export const playerStatEntrySchema = z.object({
  playerId: z.string().uuid(),
  goals: z.coerce.number().int().min(0).default(0),
  assists: z.coerce.number().int().min(0).default(0),
  yellowCards: z.coerce.number().int().min(0).max(2).default(0),
  redCards: z.coerce.number().int().min(0).max(1).default(0),
  minutesPlayed: z.coerce.number().int().min(0).max(120).default(0),
});

export type PlayerStatEntryInput = z.infer<typeof playerStatEntrySchema>;
