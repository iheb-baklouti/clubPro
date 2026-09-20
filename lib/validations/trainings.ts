import { z } from "zod";

export const trainingTypeValues = ["physique", "technique", "tactique", "recuperation"] as const;

export const trainingSchema = z.object({
  teamId: z.string().uuid("Sélectionnez une équipe"),
  date: z.string().min(1, "La date est requise"),
  type: z.enum(trainingTypeValues).default("technique"),
  description: z.string().optional().or(z.literal("")),
});

export type TrainingInput = z.infer<typeof trainingSchema>;

export const drillCategoryValues = ["physique", "technique", "tactique"] as const;

export const drillSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  category: z.enum(drillCategoryValues).default("technique"),
  description: z.string().optional().or(z.literal("")),
  diagramUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /^https?:\/\//.test(v), { message: "URL invalide (http/https)" }),
});

export type DrillInput = z.infer<typeof drillSchema>;

export const trainingExerciseSchema = z.object({
  drillId: z.string().uuid("Sélectionnez un exercice"),
  durationMinutes: z.coerce.number().int().min(1).max(180).default(10),
});

export type TrainingExerciseInput = z.infer<typeof trainingExerciseSchema>;
