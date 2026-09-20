import { z } from "zod";

// "admin" est un rôle plateforme réservé (attribution manuelle en base
// uniquement) : la direction d'un club ne peut pas se l'auto-attribuer ni
// l'attribuer à un membre via l'invitation ou le changement de rôle.
export const assignableRoleValues = ["direction", "coach", "staff_medical", "joueur"] as const;
export type AssignableRole = (typeof assignableRoleValues)[number];

// Rôles modifiables via le simple sélecteur de rôle d'un membre existant —
// "joueur" en est exclu car il nécessite de choisir le joueur associé
// (uniquement via le flux d'invitation dédié).
export const staffRoleValues = ["direction", "coach", "staff_medical"] as const;
export type StaffRole = (typeof staffRoleValues)[number];

export const inviteMemberSchema = z
  .object({
    email: z.string().min(1, "L'email est requis").email("Email invalide"),
    fullName: z.string().optional().or(z.literal("")),
    role: z.enum(assignableRoleValues).default("coach"),
    playerId: z.string().uuid().optional().or(z.literal("")),
  })
  .refine((data) => data.role !== "joueur" || !!data.playerId, {
    message: "Choisissez le joueur associé à ce compte",
    path: ["playerId"],
  });

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const roleUpdateSchema = z.object({
  role: z.enum(staffRoleValues),
});
