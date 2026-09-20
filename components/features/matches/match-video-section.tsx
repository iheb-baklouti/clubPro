"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addVideoTag, deleteVideoTag } from "@/app/(dashboard)/calendrier/video-actions";
import { getYoutubeEmbedUrl, isDirectVideoFile, formatTimestamp } from "@/lib/video-embed";
import type { VideoTagTypeValue } from "@/lib/validations/video";

const TAG_LABELS: Record<VideoTagTypeValue, string> = {
  but: "But",
  occasion: "Occasion",
  faute: "Faute",
  carton: "Carton",
};

interface VideoClip {
  id: string;
  video_url: string;
  timestamp_seconds: number;
  tag_type: VideoTagTypeValue;
  description: string | null;
}

export function MatchVideoSection({
  matchId,
  clips,
}: {
  matchId: string;
  clips: VideoClip[];
}) {
  const [videoUrlDraft, setVideoUrlDraft] = useState("");
  const [filter, setFilter] = useState<VideoTagTypeValue | "tous">("tous");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const videoUrl = clips[0]?.video_url ?? null;
  const filteredClips = filter === "tous" ? clips : clips.filter((c) => c.tag_type === filter);

  if (!videoUrl) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">
          Ajoutez le lien de la vidéo du match (YouTube ou fichier .mp4) pour commencer à taguer
          des actions.
        </p>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            const formData = new FormData();
            formData.set("timestampSeconds", "0");
            formData.set("tagType", "occasion");
            formData.set("description", "Début de la vidéo");
            startTransition(async () => {
              const result = await addVideoTag(matchId, videoUrlDraft, {}, formData);
              if (result?.error) setError(result.error);
            });
          }}
        >
          <Input
            value={videoUrlDraft}
            onChange={(e) => setVideoUrlDraft(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="min-w-64 flex-1"
          />
          <Button type="submit" disabled={isPending || !videoUrlDraft}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Ajouter la vidéo
          </Button>
        </form>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  const youtubeEmbed = getYoutubeEmbedUrl(videoUrl);

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        {youtubeEmbed ? (
          <iframe
            src={youtubeEmbed}
            title="Vidéo du match"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isDirectVideoFile(videoUrl) ? (
          <video controls src={videoUrl} className="h-full w-full" />
        ) : (
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-full items-center justify-center text-primary underline-offset-4 hover:underline"
          >
            Ouvrir la vidéo
          </a>
        )}
      </div>

      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await addVideoTag(matchId, videoUrl, {}, formData);
            if (result?.error) setError(result.error);
            else (e.target as HTMLFormElement).reset();
          });
        }}
      >
        <div className="space-y-1">
          <Label htmlFor="timestampSeconds" className="text-xs">
            Horodatage (s)
          </Label>
          <Input
            id="timestampSeconds"
            name="timestampSeconds"
            type="number"
            min={0}
            defaultValue={0}
            className="w-28"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select name="tagType" defaultValue="occasion">
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TAG_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 flex-1 min-w-40">
          <Label htmlFor="description" className="text-xs">
            Description
          </Label>
          <Input id="description" name="description" placeholder="Occasion sur coup franc..." />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Taguer
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "tous" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("tous")}
        >
          Tous ({clips.length})
        </Button>
        {Object.entries(TAG_LABELS).map(([value, label]) => {
          const count = clips.filter((c) => c.tag_type === value).length;
          if (count === 0) return null;
          return (
            <Button
              key={value}
              variant={filter === value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(value as VideoTagTypeValue)}
            >
              {label} ({count})
            </Button>
          );
        })}
      </div>

      <ul className="space-y-2">
        {filteredClips.map((clip) => (
          <li key={clip.id} className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm tabular-nums text-muted-foreground">
                {formatTimestamp(clip.timestamp_seconds)}
              </span>
              <Badge variant="outline">{TAG_LABELS[clip.tag_type]}</Badge>
              {clip.description && <span className="text-sm">{clip.description}</span>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Supprimer le tag"
              onClick={() =>
                startTransition(async () => {
                  await deleteVideoTag(clip.id, matchId);
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
