"use client";

import { useState, useEffect } from "react";

interface Props {
  vttUrl: string;
  className?: string;
}

function vttToPlainText(vtt: string): string {
  const timingRe = /^((?:\d{2}:)?\d{2}:\d{2}\.\d{3})\s-->\s((?:\d{2}:)?\d{2}:\d{2}\.\d{3})(?:\s+.*)?$/;

  return vtt
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (!t) return false;
      if (t === "WEBVTT") return false;
      if (/^\d+$/.test(t)) return false;
      if (timingRe.test(t)) return false;
      return true;
    })
    .join(" ");
}

export function VttReadAloudButton({ vttUrl, className }: Props) {
  const [isReading, setIsReading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  async function speakVtt() {
    if (!("speechSynthesis" in window)) {
      alert("Brauzeringiz ovozli o'qishni qo'llab-quvvatlamaydi");
      return;
    }
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(vttUrl);
      const vtt = await res.text();
      const text = vttToPlainText(vtt);
      if (!text.trim()) {
        alert("Subtitr matni bo'sh");
        setIsLoading(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "uz-UZ";
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    } catch {
      alert("VTT faylni o'qishda xatolik");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={speakVtt}
      disabled={isLoading}
      aria-pressed={isReading}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        isReading
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border hover:bg-muted"
      } ${className ?? ""}`}
    >
      <span aria-hidden="true">{isReading ? "⏹" : "🎧"}</span>
      {isLoading ? "Yuklanmoqda..." : isReading ? "Subtitr o'qishni to'xtatish" : "Subtitr matnini o'qish"}
    </button>
  );
}
