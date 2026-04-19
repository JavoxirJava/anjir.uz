"use client";

import { useState } from "react";
import { uz } from "@/lib/strings/uz";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  title: string;
  /** Keyboard TTS uchun */
  onReadPage?: (pageText: string) => void;
}

/**
 * Accessible PDF viewer — native <iframe> + page nav.
 * Screen reader uchun: title, aria-label.
 * Klaviatura: PDF ichida browser native navigatsiya ishlaydi.
 */
export function PdfViewer({ src, title }: Props) {
  const [loading, setLoading] = useState(true);

  const pdfUrl = `${src}#toolbar=1&navpanes=1&scrollbar=1`;

  return (
    <div className="space-y-2">
      <div
        className="relative rounded-xl overflow-hidden border bg-muted"
        style={{ height: "75vh", minHeight: "400px" }}
      >
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-muted"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm text-muted-foreground">{uz.common.loading}</p>
          </div>
        )}

        <iframe
          src={pdfUrl}
          title={`${title} — PDF hujjat`}
          className={cn("w-full h-full border-0", loading && "opacity-0")}
          onLoad={() => setLoading(false)}
          aria-label={`${title} PDF hujjati. Navigatsiya uchun PDF ko'ruvchi ichidagi tugmalardan foydalaning.`}
        />
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <a
          href={src}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={`${title} PDF faylini yuklash`}
        >
          {uz.lectures.downloadPdf}
        </a>
        <p className="text-xs">
          Ko&apos;rish muammosi bo&apos;lsa, yuklab oling
        </p>
      </div>
    </div>
  );
}
