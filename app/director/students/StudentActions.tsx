"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveStudentAction, rejectStudentAction } from "@/app/actions/director";

interface Props {
  userId: string;
  status: string;
}

export function StudentActions({ userId, status }: Props) {
  const [isPending, startTransition] = useTransition();

  if (status !== "pending") return null;

  function handleApprove() {
    startTransition(async () => {
      const result = await approveStudentAction(userId);
      if (result.success) {
        toast.success("O'quvchi tasdiqlandi");
      } else {
        toast.error("Xatolik yuz berdi");
      }
    });
  }

  function handleReject() {
    const reason = window.prompt("Rad etish sababi:");
    if (reason === null) return; // Cancel pressed
    startTransition(async () => {
      const result = await rejectStudentAction(userId, reason);
      if (result.success) {
        toast.success("O'quvchi rad etildi");
      } else {
        toast.error("Xatolik yuz berdi");
      }
    });
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        variant="default"
        onClick={handleApprove}
        disabled={isPending}
        aria-label="Tasdiqlash"
      >
        Tasdiqlash
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleReject}
        disabled={isPending}
        aria-label="Rad etish"
      >
        Rad etish
      </Button>
    </div>
  );
}
