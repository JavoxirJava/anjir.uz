"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { addBookmarkAction, removeBookmarkAction } from "@/app/actions/books";
import { AudioPlayer } from "@/components/lectures/AudioPlayer";
import { ReadAloudButton } from "@/components/lectures/ReadAloudButton";
import { uz } from "@/lib/strings/uz";

interface Props {
  bookId: string;
  pdfUrl: string;
  audioUrl: string | null;
  title: string;
  bookmarks: number[];
}

export function BookReader({ bookId, pdfUrl, audioUrl, title, bookmarks: initialBookmarks }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedPages, setBookmarkedPages] = useState<Set<number>>(new Set(initialBookmarks));
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // PDF viewer — iframe embed
  const pdfViewerUrl = `${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0`;

  const isBookmarked = bookmarkedPages.has(currentPage);

  async function toggleBookmark() {
    if (isBookmarking) return;
    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        const r = await removeBookmarkAction(bookId, currentPage);
        if (r?.error) { toast.error(r.error); return; }
        setBookmarkedPages((prev) => {
          const next = new Set(prev);
          next.delete(currentPage);
          return next;
        });
        toast.success("Xatchet olib tashlandi");
      } else {
        const r = await addBookmarkAction(bookId, currentPage, null);
        if (r?.error) { toast.error(r.error); return; }
        setBookmarkedPages((prev) => new Set([...prev, currentPage]));
        toast.success(`${currentPage}-sahifa xatchet qo'yildi`);
      }
    } finally {
      setIsBookmarking(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Boshqaruv paneli */}
      <div className="flex items-center gap-3 flex-wrap bg-muted/50 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            aria-label="Oldingi sahifa"
            disabled={currentPage <= 1}
            className="rounded p-1.5 hover:bg-muted disabled:opacity-40 focus-visible:outline-2"
          >
            ←
          </button>
          <div className="flex items-center gap-1.5">
            <label htmlFor="page-input" className="text-sm sr-only">Sahifa</label>
            <input
              id="page-input"
              type="number"
              min={1}
              value={currentPage}
              onChange={(e) => {
                const p = parseInt(e.target.value);
                if (!isNaN(p) && p >= 1) setCurrentPage(p);
              }}
              className="w-16 rounded border px-2 py-1 text-sm text-center focus-visible:outline-2"
              aria-label="Joriy sahifa"
            />
            <span className="text-sm text-muted-foreground">{uz.books.page}</span>
          </div>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            aria-label="Keyingi sahifa"
            className="rounded p-1.5 hover:bg-muted focus-visible:outline-2"
          >
            →
          </button>
        </div>

        {/* Xatchet */}
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={isBookmarking}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? uz.student.bookmarked : uz.student.bookmark}
          className={`rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 ${
            isBookmarked
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-muted"
          }`}
        >
          {isBookmarked ? "🔖 " + uz.student.bookmarked : "📌 " + uz.student.bookmark}
        </button>

        {/* Xatchet ro'yxati */}
        {bookmarkedPages.size > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Xatchetlar:</span>
            {[...bookmarkedPages].sort((a, b) => a - b).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`px-1.5 py-0.5 rounded border text-xs focus-visible:outline-2 ${
                  p === currentPage ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                }`}
                aria-label={`${p}-sahifaga o'tish`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Ovozli o'qish */}
        <ReadAloudButton
          text={`${title}, ${currentPage}-sahifa`}
          className="text-xs"
        />
      </div>

      {/* PDF ko'rsatish */}
      {!pdfError ? (
        <div className="relative">
          <iframe
            ref={iframeRef}
            src={pdfViewerUrl}
            className="w-full rounded-xl border"
            style={{ height: "calc(100vh - 250px)", minHeight: "500px" }}
            title={`${title} — ${currentPage}-sahifa`}
            onError={() => setPdfError(true)}
          />
        </div>
      ) : (
        <div className="rounded-xl border p-8 text-center space-y-3">
          <p className="text-muted-foreground">PDF ko&apos;rsatilmadi</p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted focus-visible:outline-2"
          >
            📄 {uz.lectures.downloadPdf}
          </a>
        </div>
      )}

      {/* Audio player */}
      {audioUrl && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">{uz.books.audioPlayer}</h2>
          <AudioPlayer src={audioUrl} title={title} />
        </div>
      )}
    </div>
  );
}
