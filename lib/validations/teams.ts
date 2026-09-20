import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
});

export type TeamInput = z.infer<typeof teamSchema>;

export const playerStatusValues = ["actif", "blesse", "suspendu"] as const;

export const playerSchema = z.object({
  fullName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  birthDate: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  jerseyNumber: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (Number(v) >= 1 && Number(v) <= 99), {
      message: "Le numéro doit être entre 1 et 99",
    }),
  status: z.enum(playerStatusValues).default("actif"),
  emergencyContactName: z.string().optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
  medicalNotes: z.string().optional().or(z.literal("")),
});

export type PlayerInput = z.infer<typeof playerSchema>;
