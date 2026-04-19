"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { uz } from "@/lib/strings/uz";
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
      const supabase = createClient();
      const { error } = await supabase.from("subjects").insert({ name: name.trim() });
      if (error) { toast.error("Xatolik: " + error.message); return; }
      toast.success("Fan qo'shildi");
      setName("");
      window.location.reload();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end" noValidate>
      <div className="space-y-1.5 flex-1 max-w-xs">
        <Label htmlFor="subject-name">{uz.admin.addSubject}</Label>
        <Input id="subject-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Matematika" required />
      </div>
      <Button type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending ? uz.common.loading : uz.common.add}
      </Button>
    </form>
  );
}
