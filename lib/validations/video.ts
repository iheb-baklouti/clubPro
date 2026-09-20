import { z } from "zod";

export const videoTagTypeValues = ["but", "occasion", "faute", "carton"] as const;
export type VideoTagTypeValue = (typeof videoTagTypeValues)[number];

export const matchVideoSchema = z.object({
  videoUrl: z
    .string()
    .min(1, "L'URL est requise")
    .refine((v) => /^https?:\/\//.test(v), { message: "URL invalide (http/https)" }),
});

export type MatchVideoInput = z.infer<typeof matchVideoSchema>;

export const videoTagSchema = z.object({
  timestampSeconds: z.coerce.number().int().min(0),
  tagType: z.enum(videoTagTypeValues).default("occasion"),
  description: z.string().optional().or(z.literal("")),
});

export type VideoTagInput = z.infer<typeof videoTagSchema>;
