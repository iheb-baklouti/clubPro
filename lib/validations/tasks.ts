import { z } from "zod";

export const taskStatusValues = ["a_faire", "fait"] as const;
export type TaskStatusValue = (typeof taskStatusValues)[number];

export const taskSchema = z.object({
  title: z.string().min(2, "Le titre doit contenir au moins 2 caractères"),
  description: z.string().optional().or(z.literal("")),
  teamId: z.string().optional().or(z.literal("")),
  assignedProfileId: z.string().optional().or(z.literal("")),
  assignedPlayerId: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export type TaskInput = z.infer<typeof taskSchema>;
