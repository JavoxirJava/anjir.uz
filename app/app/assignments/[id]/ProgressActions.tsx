"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateAssignmentProgressAction } from "@/app/actions/assignments";
import { Button } from "@/components/ui/button";

interface Props {
  assignmentId: string;
  progressState: "done_pending" | "done_approved" | "done_rejected" | "cannot_do" | null;
}

export function ProgressActions({ assignmentId, progressState }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function runAction(action: "done" | "cannot_do") {
    startTransition(async () => {
      const result = await updateAssignmentProgressAction(assignmentId, action);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(action === "done" ? "Belgilandi: bajardim" : "Belgilandi: bajara olmadim");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        {progressState === "done_pending" && "Holat: o'qituvchi tasdiqlashi kutilmoqda."}
        {progressState === "done_approved" && "Holat: o'qituvchi tasdiqladi."}
        {progressState === "done_rejected" && "Holat: o'qituvchi tasdiqlamadi."}
        {progressState === "cannot_do" && "Holat: bajara olmadi deb belgilangan."}
        {!progressState && "Holat hali belgilanmagan."}
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          onClick={() => runAction("done")}
          disabled={isPending}
          aria-busy={isPending}
        >
          Bajardim
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => runAction("cannot_do")}
          disabled={isPending}
          aria-busy={isPending}
        >
          Bajara olmadim
        </Button>
      </div>
    </div>
  );
}
