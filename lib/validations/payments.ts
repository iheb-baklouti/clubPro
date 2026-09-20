import { z } from "zod";

export const paymentStatusValues = ["en_attente", "paye"] as const;
export type PaymentStatusValue = (typeof paymentStatusValues)[number];

export const paymentSchema = z.object({
  playerId: z.string().uuid("Sélectionnez un joueur"),
  label: z.string().min(2, "Le libellé doit contenir au moins 2 caractères"),
  amount: z.coerce.number().positive("Le montant doit être positif"),
  dueDate: z.string().optional().or(z.literal("")),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
