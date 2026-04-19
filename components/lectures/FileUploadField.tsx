"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/useFileUpload";
import { uz } from "@/lib/strings/uz";

interface Props {
  accept: string;
  maxSizeMb: number;
  label: string;
  onUploaded: (url: string) => void;
  folder?: string;
  required?: boolean;
}

/**
 * Accessible fayl yuklash maydoni.
 * Keyboard, drag-drop va screen reader uchun to'liq qo'llab-quvvatlash.
 */
export function FileUploadField({
  accept,
  maxSizeMb,
  label,
  onUploaded,
  folder = "lectures",
  required = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, progress, reset } = useFileUpload();
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    setFileName(file.name);
    const result = await upload(file, folder);
    if (result) {
      onUploaded(result.fileUrl);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  const isDone = progress.status === "done";
  const isUploading = progress.status === "uploading";
  const isError = progress.status === "error";

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-label={`${label} yuklash. ${required ? "Majburiy." : ""} Fayl hajmi ${maxSizeMb} MB gacha.`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={onKeyDown}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          dragOver && "border-primary bg-primary/5",
          isDone && "border-green-500 bg-green-50 dark:bg-green-950/20",
          isError && "border-destructive bg-destructive/5",
          !dragOver && !isDone && !isError && "border-border hover:border-primary hover:bg-muted/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={onInputChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />

        {isUploading ? (
          <div className="w-full space-y-2" role="status" aria-live="polite">
            <p className="text-sm">{uz.common.loading} {progress.percent}%</p>
            <div
              className="w-full h-2 rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Yuklash jarayoni"
            >
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        ) : isDone ? (
          <>
            <span className="text-2xl" aria-hidden="true">✓</span>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {fileName}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); reset(); setFileName(null); }}
              className="text-xs text-muted-foreground underline hover:text-foreground focus-visible:outline-2"
              aria-label="Faylni o'chirish va qayta yuklash"
            >
              Qayta yuklash
            </button>
          </>
        ) : isError ? (
          <>
            <span className="text-2xl" aria-hidden="true">✕</span>
            <p className="text-sm text-destructive" role="alert">
              {progress.error ?? uz.errors.uploadError}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); reset(); setFileName(null); }}
              className="text-xs underline hover:text-foreground focus-visible:outline-2"
            >
              {uz.errors.tryAgain}
            </button>
          </>
        ) : (
          <>
            <span className="text-3xl" aria-hidden="true">📁</span>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">
              Fayl tanlash yoki bu yerga tashlang — max {maxSizeMb} MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
