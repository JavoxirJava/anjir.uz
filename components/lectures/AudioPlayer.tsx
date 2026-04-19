"use client";

import { useEffect, useRef, useState } from "react";
import { uz } from "@/lib/strings/uz";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  title: string;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Accessible audio player.
 * Keyboard: Space/K = pause, ←/→ = ±10s, m = mute, 0-9 = uchun %
 */
export function AudioPlayer({ src, title }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDur);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  }

  function seek(delta: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(duration, a.currentTime + delta));
  }

  function toggleMute() {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !muted;
    setMuted(!muted);
  }

  function changeSpeed(s: number) {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = s;
    setSpeed(s);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case " ": case "k": e.preventDefault(); togglePlay(); break;
      case "ArrowLeft":  e.preventDefault(); seek(-10); break;
      case "ArrowRight": e.preventDefault(); seek(10); break;
      case "m": e.preventDefault(); toggleMute(); break;
    }
  }

  const percent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      role="region"
      aria-label={`${title} — ${uz.books.audioPlayer}`}
      onKeyDown={onKeyDown}
      tabIndex={0}
      className="rounded-xl border bg-card p-4 space-y-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      <p className="text-sm font-medium truncate" aria-live="off">{title}</p>

      {/* Progress bar */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.5}
          value={currentTime}
          onChange={(e) => {
            const t = Number(e.target.value);
            if (audioRef.current) audioRef.current.currentTime = t;
            setCurrentTime(t);
          }}
          aria-label="Tinglash pozitsiyasi"
          aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
          className="w-full h-2 cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* -10s */}
        <button
          type="button"
          onClick={() => seek(-10)}
          aria-label="10 soniya orqaga"
          className="rounded-md p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span aria-hidden="true">⏮ 10s</span>
        </button>

        {/* Play/Pause */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? uz.books.pause : uz.books.resume}
          aria-pressed={playing}
          className="rounded-full w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span aria-hidden="true">{playing ? "⏸" : "▶"}</span>
        </button>

        {/* +10s */}
        <button
          type="button"
          onClick={() => seek(10)}
          aria-label="10 soniya oldinga"
          className="rounded-md p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span aria-hidden="true">10s ⏭</span>
        </button>

        {/* Mute */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Ovozni yoqish" : "Ovozni o'chirish"}
          aria-pressed={muted}
          className="rounded-md p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
        </button>

        {/* Volume */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            if (audioRef.current) audioRef.current.volume = v;
          }}
          aria-label="Ovoz darajasi"
          className="w-20 accent-primary"
        />

        {/* Speed */}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{uz.books.speed}:</span>
          {[0.75, 1, 1.25, 1.5, 2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => changeSpeed(s)}
              aria-pressed={speed === s}
              aria-label={`${s}x tezlik`}
              className={cn(
                "rounded px-1.5 py-0.5 text-xs font-medium focus-visible:outline-2",
                speed === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {playing
          ? `Tinglanyapti: ${formatTime(currentTime)}`
          : `To'xtatildi: ${formatTime(currentTime)}`}
      </p>
    </div>
  );
}
