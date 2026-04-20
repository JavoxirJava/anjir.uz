"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveUserAction, rejectUserAction } from "@/app/actions/admin";

const STATUS_LABELS: Record<string, string> = {
  active: "Faol",
  pending: "Kutilmoqda",
  rejected: "Rad etilgan",
};

const STATUS_CLASSES: Record<string, string> = {
  active: "bg-blue-100 text-blue-800 border-blue-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

interface Props {
  userId: string;
  status: string;
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={STATUS_CLASSES[status] ?? ""}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function UserActions({ userId, status }: Props) {
  const [isPending, startTransition] = useTransition();

  if (status !== "pending") return null;

  function handleApprove() {
    startTransition(async () => {
      const result = await approveUserAction(userId);
      if (result.success) {
        toast.success("Foydalanuvchi tasdiqlandi");
      } else {
        toast.error("Xatolik yuz berdi");
      }
    });
  }

  function handleReject() {
    const reason = window.prompt("Rad etish sababi (ixtiyoriy):") ?? undefined;
    startTransition(async () => {
      const result = await rejectUserAction(userId, reason || undefined);
      if (result.success) {
        toast.success("Foydalanuvchi rad etildi");
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
