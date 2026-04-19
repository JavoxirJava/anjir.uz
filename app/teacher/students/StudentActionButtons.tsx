"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
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

  async function approveStudent() {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("student_profiles")
        .update({ approved_at: new Date().toISOString(), rejected_at: null, rejection_reason: null })
        .eq("user_id", userId);

      if (error) { toast.error("Xatolik yuz berdi"); return; }

      await supabase
        .from("users")
        .update({ status: "active" })
        .eq("id", userId);

      toast.success(uz.teacher.studentApproved);
      setIsDone(true);
    });
  }

  async function rejectStudent() {
    if (!reason.trim()) { toast.error(uz.teacher.rejectReasonRequired); return; }
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("student_profiles")
        .update({ rejected_at: new Date().toISOString(), rejection_reason: reason.trim() })
        .eq("user_id", userId);

      if (error) { toast.error("Xatolik yuz berdi"); return; }

      await supabase
        .from("users")
        .update({ status: "rejected" })
        .eq("id", userId);

      toast.success(uz.teacher.studentRejected);
      setRejectMode(false);
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
            onClick={rejectStudent}
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
        onClick={approveStudent}
        disabled={isPending}
        aria-label={`${uz.teacher.approveStudent}`}
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
