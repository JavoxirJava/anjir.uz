"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addSubjectAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddSubjectForm() {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Fan nomi kiritilishi shart"); return; }
    startTransition(async () => {
      const result = await addSubjectAction(name.trim());
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Fan qo'shildi");
        setName("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end" noValidate>
      <div className="space-y-1.5 flex-1 max-w-xs">
        <Label htmlFor="subject-name">Fan qo&apos;shish</Label>
        <Input
          id="subject-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Matematika, Fizika..."
          required
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending ? "Saqlanmoqda..." : "+ Qo'shish"}
      </Button>
    </form>
  );
}
