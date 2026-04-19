"use client";

import { useEffect } from "react";
import { uz } from "@/lib/strings/uz";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <h2 className="text-xl font-semibold">{uz.errors.serverError}</h2>
      <p className="text-muted-foreground text-sm">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md px-4 py-2 text-sm border hover:bg-muted focus-visible:outline-2"
      >
        {uz.errors.tryAgain}
      </button>
    </div>
  );
}
