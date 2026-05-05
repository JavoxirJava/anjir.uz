"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ACCESS_TOKEN_COOKIE, API_URL } from "@/lib/api/config";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${ACCESS_TOKEN_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function TestExportButton({ id, title }: { id: string; title: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tests/${id}/export`, {
        headers: { Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) { toast.error("Yuklab bo'lmadi"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^\w\s-]/g, "")}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      aria-busy={loading}
      aria-label={`${title} testini Excel da yuklab olish`}
      className="rounded-md px-3 py-1.5 text-sm border hover:bg-muted focus-visible:outline-2 disabled:opacity-50"
    >
      {loading ? "…" : "⬇ Excel"}
    </button>
  );
}
