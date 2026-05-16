"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { reviewAssignmentProgressAction } from "@/app/actions/assignments";
import { Button } from "@/components/ui/button";

interface Props {
  submissionId: string;
  assignmentId: string;
}

export function ProgressReviewActions({ submissionId, assignmentId }: Props) {
  const [isPending, startTransition] = useTransition();

  function onReview(decision: "approve" | "reject") {
    startTransition(async () => {
      const result = await reviewAssignmentProgressAction(submissionId, assignmentId, decision);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(decision === "approve" ? "Tasdiqlandi" : "Tasdiqlanmadi");
    });
  }

  return (
    <div className="border-t pt-3 space-y-2">
      <p className="text-sm text-muted-foreground">O&apos;quvchi “Bajardim” deb yuborgan.</p>
      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={() => onReview("approve")} disabled={isPending}>
          Tasdiqlash
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onReview("reject")} disabled={isPending}>
          Tasdiqlamaslik
        </Button>
      </div>
    </div>
  );
}
