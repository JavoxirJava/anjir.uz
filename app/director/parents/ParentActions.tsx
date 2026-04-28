"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveParentAction, rejectParentAction } from "@/app/actions/director";

export function ParentActions({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveParentAction(userId);
      if (result.success) toast.success("Ota-ona tasdiqlandi");
      else toast.error("Xatolik yuz berdi");
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectParentAction(userId);
      if (result.success) toast.success("Ota-ona rad etildi");
      else toast.error("Xatolik yuz berdi");
    });
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button size="sm" onClick={handleApprove} disabled={isPending}>Tasdiqlash</Button>
      <Button size="sm" variant="destructive" onClick={handleReject} disabled={isPending}>Rad etish</Button>
    </div>
  );
}
