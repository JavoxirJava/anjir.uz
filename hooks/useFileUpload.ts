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
 * R2 presigned URL orqali fayl yuklash hook'i.
 * /api/upload dan URL oladi, keyin to'g'ridan-to'g'ri R2 ga PUT qiladi.
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
    setProgress({ percent: 0, status: "uploading" });

    try {
      // 1. Presigned URL olish
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: file.type,
          fileName: file.name,
          fileSize: file.size,
          folder,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setProgress({ percent: 0, status: "error", error });
        return null;
      }

      const { uploadUrl, fileUrl, key } = await res.json();

      // 2. XHR bilan progress kuzatib yuklash
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress({ percent, status: "uploading" });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload xatoligi: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Tarmoq xatoligi"));
        xhr.send(file);
      });

      setProgress({ percent: 100, status: "done" });
      return { fileUrl, key };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Yuklashda xatolik";
      setProgress({ percent: 0, status: "error", error: msg });
      return null;
    }
  }

  function reset() {
    setProgress({ percent: 0, status: "idle" });
  }

  return { upload, progress, reset };
}
