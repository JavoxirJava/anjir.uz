"use client";

import { useState } from "react";

interface UploadResult {
  fileUrl: string;
  key: string;
}

interface UploadProgress {
  percent: number;
  status: "idle" | "uploading" | "done" | "error";
  error?: string;
}

/**
 * Server-proxy orqali fayl yuklash hook'i.
 * Fayl /api/upload ga FormData sifatida yuboriladi,
 * server uni R2 ga yuklaydi (CORS muammosi yo'q).
 */
export function useFileUpload() {
  const [progress, setProgress] = useState<UploadProgress>({
    percent: 0,
    status: "idle",
  });

  async function upload(
    file: File,
    folder = "lectures"
  ): Promise<UploadResult | null> {
    setProgress({ percent: 10, status: "uploading" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      setProgress({ percent: 30, status: "uploading" });

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress({ percent: 80, status: "uploading" });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Yuklashda xatolik" }));
        setProgress({ percent: 0, status: "error", error: body.error ?? "Yuklashda xatolik" });
        return null;
      }

      const { fileUrl, key } = await res.json();

      setProgress({ percent: 100, status: "done" });
      return { fileUrl, key };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tarmoq xatoligi";
      setProgress({ percent: 0, status: "error", error: msg });
      return null;
    }
  }

  function reset() {
    setProgress({ percent: 0, status: "idle" });
  }

  return { upload, progress, reset };
}
