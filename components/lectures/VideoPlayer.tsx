"use client";

import { useRef, useState, useEffect } from "react";
import { uz } from "@/lib/strings/uz";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  title: string;
  subtitleUrl?: string;
  /** Cloudflare Stream UID bo'lsa, embed ishlatiladi */
  streamUid?: string;
}

/**
 * Accessible video player.
 * Native <video> + <track> — screen reader subtitrni o'qiydi.
 * Keyboard: Space=pause, F=fullscreen, C=subtitr toggle, ←/→=±10s
 */
export function VideoPlayer({ src, title, subtitleUrl, streamUid }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [subtitlesOn, setSubtitlesOn] = useState(!!subtitleUrl);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onDur = () => setDuration(v.duration);
    const onEnd = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onDur);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onDur);
      v.removeEventListener("ended", onEnd);
    };
  }, []);

  // Subtitles toggle
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !v.textTracks[0]) return;
    v.textTracks[0].mode = subtitlesOn ? "showing" : "hidden";
  }, [subtitlesOn]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); }
  }

  function seek(delta: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(duration, v.currentTime + delta));
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case " ": case "k": e.preventDefault(); togglePlay(); break;
      case "ArrowLeft": e.preventDefault(); seek(-10); break;
      case "ArrowRight": e.preventDefault(); seek(10); break;
      case "f": case "F": e.preventDefault(); toggleFullscreen(); break;
      case "c": case "C": e.preventDefault(); setSubtitlesOn((p) => !p); break;
    }
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Cloudflare Stream embedi
  if (streamUid) {
    return (
      <div className="space-y-2">
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={`https://iframe.videodelivery.net/${streamUid}?subtitles=true`}
            title={title}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        {subtitleUrl && (
          <p className="text-xs text-muted-foreground">
            Subtitr: Cloudflare Stream orqali yoqilgan
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={`${title} — video`}
      onKeyDown={onKeyDown}
      tabIndex={0}
      className="rounded-xl overflow-hidden bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video"
        preload="metadata"
        onClick={togglePlay}
        aria-label={title}
        crossOrigin="anonymous"
      >
        {subtitleUrl && (
          <track
            kind="subtitles"
            src={subtitleUrl}
            srcLang="uz"
            label="O'zbek"
            default={subtitlesOn}
          />
        )}
        <p>Brauzeringiz videoni qo&apos;llab-quvvatlamaydi.</p>
      </video>

      {/* Controls */}
      <div className="bg-black/80 px-4 py-2 space-y-2">
        {/* Seekbar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.5}
          value={currentTime}
          onChange={(e) => {
            const t = Number(e.target.value);
            if (videoRef.current) videoRef.current.currentTime = t;
            setCurrentTime(t);
          }}
          aria-label="Video pozitsiyasi"
          aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          className="w-full h-1.5 cursor-pointer accent-white"
        />

        <div className="flex items-center gap-2 text-white">
          <button
            type="button"
            onClick={() => seek(-10)}
            aria-label="10 soniya orqaga"
            className="p-1 rounded hover:bg-white/20 focus-visible:outline-2"
          >
            <span aria-hidden="true">⏮</span>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? uz.books.pause : uz.books.resume}
            aria-pressed={playing}
            className="p-1 rounded hover:bg-white/20 focus-visible:outline-2"
          >
            <span aria-hidden="true">{playing ? "⏸" : "▶"}</span>
          </button>

          <button
            type="button"
            onClick={() => seek(10)}
            aria-label="10 soniya oldinga"
            className="p-1 rounded hover:bg-white/20 focus-visible:outline-2"
          >
            <span aria-hidden="true">⏭</span>
          </button>

          <span className="text-xs tabular-nums" aria-live="off" aria-atomic="true">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {subtitleUrl && (
              <button
                type="button"
                onClick={() => setSubtitlesOn((p) => !p)}
                aria-label={subtitlesOn ? "Subtitrni o'chirish" : "Subtitrni yoqish"}
                aria-pressed={subtitlesOn}
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium focus-visible:outline-2",
                  subtitlesOn ? "bg-white text-black" : "hover:bg-white/20"
                )}
              >
                CC
              </button>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Kichraytirish" : "To'liq ekran"}
              className="p-1 rounded hover:bg-white/20 focus-visible:outline-2"
            >
              <span aria-hidden="true">{fullscreen ? "⛶" : "⛶"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
