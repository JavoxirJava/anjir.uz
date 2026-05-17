"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api/browser";

interface Props {
  pdfUrl: string;
  className?: string;
}

export function PdfReadAloudButton({ pdfUrl, className }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);

  async function handleRead() {
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
      const data = await apiPost<{ text: string }>("/lectures/pdf-text", { url: pdfUrl })
        .catch((e: unknown) => ({ error: e instanceof Error ? e.message : "PDF matnini o'qib bo'lmadi" } as { error: string }));

      if (!("text" in data) || !data.text) {
        alert((data as { error?: string }).error ?? "PDF matnini o'qib bo'lmadi");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(data.text);
      utterance.lang = "uz-UZ";
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);

      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    } catch {
      alert("PDF matnini o'qishda xatolik");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRead}
      disabled={isLoading}
      aria-pressed={isReading}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        isReading
          ? "bg-primary text-primary-foreground border-primary"
          : "border-border hover:bg-muted"
      } ${className ?? ""}`}
    >
      <span aria-hidden="true">{isReading ? "⏹" : "📄"}</span>
      {isLoading ? "Yuklanmoqda..." : isReading ? "PDF o'qishni to'xtatish" : "PDF matnini o'qish"}
    </button>
  );
}
