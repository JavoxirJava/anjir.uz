"use client";

import { useState, useCallback } from "react";
import { uz } from "@/lib/strings/uz";

interface Props {
  text: string;
  className?: string;
}

/**
 * Web Speech API orqali matnni ovozli o'qib berish tugmasi.
 * Screen reader'ga moslangan: aria-pressed, aria-live.
 */
export function ReadAloudButton({ text, className }: Props) {
  const [isReading, setIsReading] = useState(false);

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      alert("Brauzeringiz ovozli o'qishni qo'llab-quvvatlamaydi");
      return;
    }

    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "uz-UZ";
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  }, [text, isReading]);

  return (
    <>
      <button
        type="button"
        onClick={speak}
        aria-pressed={isReading}
        aria-label={isReading ? uz.student.stopReading : uz.student.readAloud}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
          isReading
            ? "bg-primary text-primary-foreground border-primary"
            : "border-border hover:bg-muted"
        } ${className ?? ""}`}
      >
        <span aria-hidden="true">{isReading ? "⏹" : "🔊"}</span>
        {isReading ? uz.student.stopReading : uz.student.readAloud}
      </button>

      {/* Screen reader uchun holat */}
      <span
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isReading ? "O'qish boshlandi" : "O'qish to'xtatildi"}
      </span>
    </>
  );
}
