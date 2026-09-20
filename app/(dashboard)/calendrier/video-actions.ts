"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { mutationError } from "@/lib/supabase/mutations";
import { videoTagSchema } from "@/lib/validations/video";

export interface ActionState {
  error?: string;
}

export async function addVideoTag(
  matchId: string,
  videoUrl: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!/^https?:\/\//.test(videoUrl)) {
    return { error: "URL vidéo invalide." };
  }

  const parsed = videoTagSchema.safeParse({
    timestampSeconds: formData.get("timestampSeconds"),
    tagType: formData.get("tagType") || "occasion",
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("video_clips").insert({
    match_id: matchId,
    video_url: videoUrl,
    timestamp_seconds: parsed.data.timestampSeconds,
    tag_type: parsed.data.tagType,
    description: parsed.data.description || null,
    created_by: user?.id,
  });

  if (error) return { error: "Impossible d'ajouter le tag : " + error.message };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}

export async function deleteVideoTag(clipId: string, matchId: string): Promise<ActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("video_clips")
    .delete()
    .eq("id", clipId)
    .select("id");

  const err = mutationError(error, data, "Impossible de supprimer le tag");
  if (err) return { error: err };

  revalidatePath(`/calendrier/${matchId}`);
  return {};
}
