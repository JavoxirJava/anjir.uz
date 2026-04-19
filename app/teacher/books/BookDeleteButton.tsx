"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteBookAction } from "@/app/actions/books";
import { uz } from "@/lib/strings/uz";

export function BookDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      aria-busy={isPending}
      aria-label="Kitobni o'chirish"
      onClick={() => {
        if (!confirm("Kitobni o'chirishni tasdiqlaysizmi?")) return;
        startTransition(async () => {
          const r = await deleteBookAction(id);
          if (r?.error) toast.error(r.error);
          else toast.success("Kitob o'chirildi");
        });
      }}
      className="rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50 focus-visible:outline-2 transition-colors"
    >
      {isPending ? "..." : uz.common.delete}
    </button>
  );
}
