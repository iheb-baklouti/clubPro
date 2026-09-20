import { z } from "zod";

// "admin" est un rôle plateforme réservé (attribution manuelle en base
// uniquement) : la direction d'un club ne peut pas se l'auto-attribuer ni
// l'attribuer à un membre via l'invitation ou le changement de rôle.
export const assignableRoleValues = ["direction", "coach", "staff_medical"] as const;
export type AssignableRole = (typeof assignableRoleValues)[number];

export const inviteMemberSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  fullName: z.string().optional().or(z.literal("")),
  role: z.enum(assignableRoleValues).default("coach"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const roleUpdateSchema = z.object({
  role: z.enum(assignableRoleValues),
});
