"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="text-6xl">😕</div>
      <h1 className="text-3xl font-black">Xatolik yuz berdi</h1>
      <p className="text-muted-foreground text-sm max-w-sm">{error.message}</p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm">Qayta urinish</button>
        <Link href="/" className="px-4 py-2 border rounded-lg font-semibold text-sm hover:bg-muted">Bosh sahifa</Link>
      </div>
    </div>
  );
}
