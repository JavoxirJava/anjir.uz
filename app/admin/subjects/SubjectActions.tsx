"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateSubjectAction, deleteSubjectAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Subject { id: string; name: string }

export function SubjectActions({ subject }: { subject: Subject }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(subject.name);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!name.trim()) { toast.error("Fan nomi kiritilishi shart"); return; }
    startTransition(async () => {
      const result = await updateSubjectAction(subject.id, name.trim());
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Fan yangilandi");
        setEditing(false);
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(`"${subject.name}" fanini o'chirishni tasdiqlaysizmi?`)) return;
    startTransition(async () => {
      const result = await deleteSubjectAction(subject.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Fan o'chirildi");
      }
    });
  }

  if (editing) {
    return (
      <div className="flex gap-2 items-center min-w-[200px]">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Fan nomi"
          disabled={isPending}
          className="h-8 text-sm"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditing(false); setName(subject.name); } }}
        />
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "..." : "Saqlash"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => { setEditing(false); setName(subject.name); }} disabled={isPending}>
          Bekor
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-1 shrink-0">
      <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={isPending}>
        Tahrirlash
      </Button>
      <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isPending}>
        {isPending ? "..." : "O'chirish"}
      </Button>
    </div>
  );
}
