"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTestAction } from "@/app/actions/tests";
import { uz } from "@/lib/strings/uz";

export function TestDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-busy={isPending}
      aria-label="Testni o'chirish"
      onClick={() => {
        if (!confirm("Testni o'chirishni tasdiqlaysizmi?")) return;
        startTransition(async () => {
          const r = await deleteTestAction(id);
          if (r?.error) toast.error(r.error);
          else toast.success("Test o'chirildi");
        });
      }}
      className="rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50 focus-visible:outline-2 transition-colors"
    >
      {isPending ? "..." : uz.common.delete}
    </button>
  );
}
