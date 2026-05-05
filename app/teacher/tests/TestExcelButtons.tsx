"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ACCESS_TOKEN_COOKIE, API_URL } from "@/lib/api/config";
import { Button } from "@/components/ui/button";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function TestExcelButtons({ onImported }: { onImported?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  async function downloadTemplate() {
    const token = getToken();
    const res = await fetch(`${API_URL}/tests/template`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) { toast.error("Shablon yuklab bo'lmadi"); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test-shablon.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const subjectId = prompt("Fan ID sini kiriting (UUID):");
    if (!subjectId) return;

    setImporting(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("file", file);
      fd.append("subject_id", subjectId);
      fd.append("class_ids", "[]");

      const res = await fetch(`${API_URL}/tests/import`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json() as { id?: string; question_count?: number; error?: string };
      if (!res.ok) { toast.error(data.error ?? "Yuklashda xatolik"); return; }
      toast.success(`Test yuklandi — ${data.question_count} ta savol`);
      onImported?.();
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={downloadTemplate}
        aria-label="Excel shablonini yuklab olish"
      >
        ⬇ Shablon
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={importing}
        aria-busy={importing}
        onClick={() => fileRef.current?.click()}
        aria-label="Excel fayldan test yuklash"
      >
        {importing ? "Yuklanmoqda…" : "⬆ Excel dan yuklash"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="sr-only"
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  );
}
