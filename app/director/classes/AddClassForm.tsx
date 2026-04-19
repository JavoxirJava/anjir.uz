"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddClassForm({ schoolId }: { schoolId: string }) {
  const [isPending, startTransition] = useTransition();
  const [grade, setGrade] = useState("");
  const [letter, setLetter] = useState("");
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const g = parseInt(grade);
    if (isNaN(g) || g < 1 || g > 11) { toast.error("Sinf raqami 1-11 oralig'ida bo'lishi kerak"); return; }
    if (!letter.trim()) { toast.error("Sinf harfi kiritilishi shart"); return; }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("classes")
        .insert({ school_id: schoolId, grade: g, letter: letter.trim().toUpperCase() });
      if (error) { toast.error("Xatolik: " + error.message); return; }
      toast.success("Sinf qo'shildi");
      setGrade(""); setLetter(""); setOpen(false);
      window.location.reload();
    });
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        + {uz.director.addClass}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end flex-wrap" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="cls-grade">{uz.school.grade} (1–11)</Label>
        <Input id="cls-grade" type="number" min={1} max={11} value={grade} onChange={(e) => setGrade(e.target.value)} className="w-24" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cls-letter">{uz.school.letter}</Label>
        <Input id="cls-letter" value={letter} onChange={(e) => setLetter(e.target.value)} placeholder="A" className="w-20" maxLength={2} required />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {isPending ? uz.common.loading : uz.common.add}
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          {uz.common.cancel}
        </Button>
      </div>
    </form>
  );
}
