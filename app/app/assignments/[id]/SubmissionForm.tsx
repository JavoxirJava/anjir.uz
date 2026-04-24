"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitAssignmentAction } from "@/app/actions/assignments";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  assignmentId: string;
  existingContent?: string;
}

export function SubmissionForm({ assignmentId, existingContent = "" }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState(existingContent);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Javobingizni kiriting");
      return;
    }

    const fd = new FormData();
    fd.append("assignment_id", assignmentId);
    fd.append("text", content.trim());

    startTransition(async () => {
      const result = await submitAssignmentAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Topshiriq yuborildi!");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Topshiriq yuborish">
      <div className="space-y-1.5">
        <Label htmlFor="submission-content">Javobingiz *</Label>
        <Textarea
          id="submission-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Javobingizni shu yerga yozing..."
          rows={8}
          required
          aria-required="true"
          className="resize-y"
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending || !content.trim()}
          aria-busy={isPending}
        >
          {isPending ? uz.common.loading : uz.common.submit}
        </Button>
      </div>
    </form>
  );
}
