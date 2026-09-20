"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Loader2 } from "lucide-react";

import { loadYoutubeIframeApi, type YoutubePlayer } from "@/lib/youtube-iframe-api";

export interface YoutubeSyncPlayerHandle {
  seekTo(seconds: number): void;
  play(): void;
  pause(): void;
  setPlaybackRate(rate: number): void;
}

/**
 * Lecteur YouTube piloté par l'API IFrame plutôt qu'un simple <iframe src=...> :
 * expose seekTo/play/pause/setPlaybackRate à la timeline tactique (Phase 3 —
 * vidéo synchronisée) et remonte la position de lecture via onTick pour que
 * le pitch 3D suive la vidéo pendant la lecture.
 */
export const YoutubeSyncPlayer = forwardRef<
  YoutubeSyncPlayerHandle,
  {
    videoId: string;
    onTick: (seconds: number) => void;
    onPlayStateChange?: (playing: boolean) => void;
  }
>(function YoutubeSyncPlayer({ videoId, onTick, onPlayStateChange }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YoutubePlayer | null>(null);
  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    let cancelled = false;

    loadYoutubeIframeApi().then((YT) => {
      if (cancelled || !containerRef.current) return;
      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        events: {
          onStateChange: (event) => {
            const playing = event.data === YT.PlayerState.PLAYING;
            onPlayStateChange?.(playing);
            if (playing) {
              tickInterval.current = setInterval(() => {
                onTickRef.current(playerRef.current?.getCurrentTime() ?? 0);
              }, 200);
            } else if (tickInterval.current) {
              clearInterval(tickInterval.current);
              tickInterval.current = null;
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (tickInterval.current) clearInterval(tickInterval.current);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  useImperativeHandle(ref, () => ({
    seekTo(seconds) {
      playerRef.current?.seekTo(seconds, true);
    },
    play() {
      playerRef.current?.playVideo();
    },
    pause() {
      playerRef.current?.pauseVideo();
    },
    setPlaybackRate(rate) {
      playerRef.current?.setPlaybackRate(rate);
    },
  }));

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <div ref={containerRef} className="h-full w-full" />
      {!playerRef.current && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-white/70" />
        </div>
      )}
    </div>
  );
});
