"use client";

import { useEffect, useState } from "react";

type Cue = {
  time: string;
  text: string;
};

interface Props {
  vttUrl: string;
  className?: string;
}

function parseVtt(vtt: string): Cue[] {
  const lines = vtt.replace(/\r/g, "").split("\n");
  const cues: Cue[] = [];
  const timingRe = /^((?:\d{2}:)?\d{2}:\d{2}\.\d{3})\s-->\s((?:\d{2}:)?\d{2}:\d{2}\.\d{3})(?:\s+.*)?$/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const match = line.match(timingRe);

    if (!match) {
      i += 1;
      continue;
    }

    const start = match[1] ?? "";
    const textLines: string[] = [];
    i += 1;

    while (i < lines.length && lines[i].trim()) {
      textLines.push(lines[i].trim());
      i += 1;
    }

    const text = textLines.join(" ").trim();
    if (text) {
      cues.push({ time: start, text });
    }

    i += 1;
  }

  return cues;
}

export function VttSubtitlePreview({ vttUrl, className }: Props) {
  const [cues, setCues] = useState<Cue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVtt() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(vttUrl);
        if (!res.ok) {
          throw new Error("VTT yuklanmadi");
        }

        const vtt = await res.text();
        const parsed = parseVtt(vtt);
        if (!cancelled) setCues(parsed);
      } catch {
        if (!cancelled) setError("Subtitr matnini yuklab bo'lmadi");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadVtt();

    return () => {
      cancelled = true;
    };
  }, [vttUrl]);

  return (
    <div className={`rounded-md border bg-muted/30 p-3 ${className ?? ""}`}>
      <h3 className="text-sm font-semibold mb-2">Subtitr matni</h3>

      {isLoading && <p className="text-xs text-muted-foreground">Yuklanmoqda...</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}

      {!isLoading && !error && cues.length === 0 && (
        <p className="text-xs text-muted-foreground">Subtitr matni topilmadi</p>
      )}

      {!isLoading && !error && cues.length > 0 && (
        <ul className="max-h-72 overflow-auto space-y-2 pr-1" aria-label="Subtitr matni ro'yxati">
          {cues.map((cue, idx) => (
            <li key={`${cue.time}-${idx}`} className="text-sm leading-6">
              <span className="font-mono text-xs text-muted-foreground mr-2">{cue.time}</span>
              <span>{cue.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
