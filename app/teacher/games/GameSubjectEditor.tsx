"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateGameSubjectAction } from "@/app/actions/games";
import { Button } from "@/components/ui/button";

interface SubjectOption {
  id: string;
  name: string;
}

interface Props {
  gameId: string;
  currentSubjectId: string | null;
  subjects: SubjectOption[];
}

export function GameSubjectEditor({ gameId, currentSubjectId, subjects }: Props) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(currentSubjectId ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateGameSubjectAction(gameId, selectedSubjectId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Mavzu yangilandi");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedSubjectId}
        onChange={(e) => setSelectedSubjectId(e.target.value)}
        className="rounded-md border px-2.5 py-1.5 text-xs bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Mavzuni tanlang"
      >
        <option value="">Mavzu tanlang</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending || !selectedSubjectId}
        onClick={handleSave}
      >
        {isPending ? "Saqlanmoqda..." : "Mavzuni saqlash"}
      </Button>
    </div>
  );
}
