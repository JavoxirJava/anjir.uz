"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateGameSubjectAction } from "@/app/actions/games";
import { Button } from "@/components/ui/button";

interface TopicOption {
  id: string;
  name: string;
  subject_id: string;
  subject_name: string;
}

interface Props {
  gameId: string;
  currentTopicId: string | null;
  topics: TopicOption[];
}

export function GameSubjectEditor({ gameId, currentTopicId, topics }: Props) {
  const [selectedTopicId, setSelectedTopicId] = useState(currentTopicId ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateGameSubjectAction(gameId, selectedTopicId);
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
        value={selectedTopicId}
        onChange={(e) => setSelectedTopicId(e.target.value)}
        className="rounded-md border px-2.5 py-1.5 text-xs bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Mavzuni tanlang"
      >
        <option value="">Mavzu tanlang</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.subject_name})
          </option>
        ))}
      </select>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending || !selectedTopicId}
        onClick={handleSave}
      >
        {isPending ? "Saqlanmoqda..." : "Mavzuni saqlash"}
      </Button>
    </div>
  );
}
