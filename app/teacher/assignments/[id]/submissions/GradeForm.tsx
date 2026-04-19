"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { gradeSubmissionAction } from "@/app/actions/assignments";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  submissionId: string;
  assignmentId: string;
  maxScore: number;
  currentScore: number | null;
  currentComment: string | null;
}

export function GradeForm({
  submissionId,
  assignmentId,
  maxScore,
  currentScore,
  currentComment,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState(currentScore?.toString() ?? "");
  const [comment, setComment] = useState(currentComment ?? "");
  const [isOpen, setIsOpen] = useState(!currentScore);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm text-primary underline focus-visible:outline-2"
      >
        Bahoni o&apos;zgartirish
      </button>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s = parseInt(score);
    if (isNaN(s) || s < 0 || s > maxScore) {
      toast.error(`Ball 0–${maxScore} oralig'ida bo'lishi kerak`);
      return;
    }

    startTransition(async () => {
      const result = await gradeSubmissionAction(submissionId, s, comment || null, assignmentId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Baho saqlandi");
        setIsOpen(false);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border-t pt-3 space-y-3" aria-label="Baholash formasi">
      <div className="flex items-end gap-3">
        <div className="space-y-1.5 flex-1 max-w-32">
          <Label htmlFor={`score-${submissionId}`}>
            Ball (0–{maxScore})
          </Label>
          <Input
            id={`score-${submissionId}`}
            type="number"
            min={0}
            max={maxScore}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder={`0–${maxScore}`}
            aria-required="true"
          />
        </div>
        <div className="space-y-1.5 flex-1">
          <Label htmlFor={`comment-${submissionId}`}>Izoh (ixtiyoriy)</Label>
          <Textarea
            id={`comment-${submissionId}`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="O'quvchiga izoh..."
            rows={2}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending} aria-busy={isPending}>
          {isPending ? uz.common.loading : uz.teacher.gradeAssignment}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(false)}
          disabled={isPending}
        >
          {uz.common.cancel}
        </Button>
      </div>
    </form>
  );
}
