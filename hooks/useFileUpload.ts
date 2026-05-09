"use client";

import { useState } from "react";

interface UploadResult {
  fileUrl: string;
  key?: string;
}

interface UploadProgress {
  percent: number;
  status: "idle" | "uploading" | "done" | "error";
  error?: string;
}

const PROXY_SIZE_LIMIT = 5 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm"];

export function useFileUpload() {
  const [progress, setProgress] = useState<UploadProgress>({ percent: 0, status: "idle" });

  async function upload(file: File, folder = "lectures"): Promise<UploadResult | null> {
    setProgress({ percent: 5, status: "uploading" });
    try {
      if (VIDEO_TYPES.includes(file.type)) {
        return await uploadViaStream(file);
      }
      if (file.size > PROXY_SIZE_LIMIT) {
        return await uploadViaPresign(file, folder);
      }
      return await uploadViaProxy(file, folder);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tarmoq xatoligi";
      setProgress({ percent: 0, status: "error", error: msg });
      return null;
    }
  }

  async function uploadViaProxy(file: File, folder: string): Promise<UploadResult | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    setProgress({ percent: 30, status: "uploading" });

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    setProgress({ percent: 90, status: "uploading" });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Yuklashda xatolik" }));
      setProgress({ percent: 0, status: "error", error: body.error ?? "Yuklashda xatolik" });
      return null;
    }

    const { fileUrl, key } = await res.json();
    setProgress({ percent: 100, status: "done" });
    return { fileUrl, key };
  }

  async function uploadViaPresign(file: File, folder: string): Promise<UploadResult | null> {
    setProgress({ percent: 10, status: "uploading" });

    const presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, contentType: file.type, folder, fileSize: file.size }),
    });

    if (!presignRes.ok) {
      const body = await presignRes.json().catch(() => ({ error: "Yuklashda xatolik" }));
      setProgress({ percent: 0, status: "error", error: body.error ?? "Yuklashda xatolik" });
      return null;
    }

    const { presignedUrl, fileUrl, key } = await presignRes.json();

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress({ percent: Math.round(10 + (e.loaded / e.total) * 88), status: "uploading" });
        }
      };
      xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`R2 xatolik: ${xhr.status}`));
      xhr.onerror = () => reject(new Error("Tarmoq xatoligi"));
      xhr.send(file);
    });

    setProgress({ percent: 100, status: "done" });
    return { fileUrl, key };
  }

  async function uploadViaStream(file: File): Promise<UploadResult | null> {
    setProgress({ percent: 5, status: "uploading" });

    const res = await fetch("/api/upload/stream", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Stream URL xatolik" }));
      setProgress({ percent: 0, status: "error", error: body.error ?? "Stream URL xatolik" });
      return null;
    }

    const { uploadURL, fileUrl } = await res.json();

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadURL);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress({ percent: Math.round(5 + (e.loaded / e.total) * 93), status: "uploading" });
        }
      };
      xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Stream xatolik: ${xhr.status} ${xhr.responseText}`));
      xhr.onerror = () => reject(new Error("Tarmoq xatoligi"));

      const fd = new FormData();
      fd.append("file", file);
      xhr.send(fd);
    });

    setProgress({ percent: 100, status: "done" });
    return { fileUrl };
  }

  function reset() {
    setProgress({ percent: 0, status: "idle" });
  }

  return { upload, progress, reset };
}
