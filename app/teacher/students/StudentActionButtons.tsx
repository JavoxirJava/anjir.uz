"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { approveStudentAction, rejectStudentAction } from "@/app/actions/teacher";
import { uz } from "@/lib/strings/uz";

interface Props {
  userId: string;
  approved: boolean;
}

export function StudentActionButtons({ userId, approved }: Props) {
  const [isPending, startTransition] = useTransition();
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [isDone, setIsDone] = useState(approved);

  function handleApprove() {
    startTransition(async () => {
      const res = await approveStudentAction(userId);
      if (res?.error) { toast.error(res.error); return; }
      toast.success(uz.teacher.studentApproved);
      setIsDone(true);
    });
  }

  function handleReject() {
    if (!reason.trim()) { toast.error(uz.teacher.rejectReasonRequired); return; }
    startTransition(async () => {
      const res = await rejectStudentAction(userId, reason);
      if (res?.error) { toast.error(res.error); return; }
      toast.success(uz.teacher.studentRejected);
      setRejectMode(false);
      setIsDone(true);
    });
  }

  if (isDone) {
    return <span className="text-xs text-green-600">✓ Tasdiqlangan</span>;
  }

  if (rejectMode) {
    return (
      <div className="flex flex-col gap-2 items-end">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={uz.teacher.rejectReason}
          className="rounded border px-2 py-1 text-sm focus-visible:outline-2 w-48"
          aria-label={uz.teacher.rejectReason}
          aria-required="true"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReject}
            disabled={isPending}
            className="text-sm text-destructive border border-destructive rounded px-2 py-1 hover:bg-destructive/10 focus-visible:outline-2 disabled:opacity-50"
          >
            {isPending ? "..." : uz.teacher.rejectStudent}
          </button>
          <button
            type="button"
            onClick={() => setRejectMode(false)}
            className="text-sm border rounded px-2 py-1 hover:bg-muted focus-visible:outline-2"
          >
            {uz.common.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending}
        aria-label={uz.teacher.approveStudent}
        className="text-sm text-green-700 border border-green-600 rounded px-3 py-1 hover:bg-green-50 dark:hover:bg-green-950/30 focus-visible:outline-2 disabled:opacity-50 transition-colors"
      >
        {isPending ? "..." : uz.teacher.approveStudent}
      </button>
      <button
        type="button"
        onClick={() => setRejectMode(true)}
        aria-label={uz.teacher.rejectStudent}
        className="text-sm text-muted-foreground border rounded px-3 py-1 hover:bg-muted focus-visible:outline-2 transition-colors"
      >
        {uz.teacher.rejectStudent}
      </button>
    </div>
  );
}
