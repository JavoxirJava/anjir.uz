"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteLectureAction } from "@/app/actions/lectures";
import { uz } from "@/lib/strings/uz";

interface Props {
  id: string;
  fileUrl: string;
}

export function LectureDeleteButton({ id, fileUrl }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Ma'ruzani o'chirishni tasdiqlaysizmi?")) return;
    startTransition(async () => {
      const result = await deleteLectureAction(id, fileUrl);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Ma'ruza o'chirildi");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-busy={isPending}
      aria-label="Ma'ruzani o'chirish"
      className="shrink-0 rounded-md px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors"
    >
      {isPending ? "..." : uz.common.delete}
    </button>
  );
}
