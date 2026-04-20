"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Subject {
  id: string;
  name: string;
}

interface Props {
  subject: Subject;
}

export function SubjectActions({ subject }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(subject.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Fan nomi kiritilishi shart");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("subjects")
      .update({ name: name.trim() })
      .eq("id", subject.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Fan muvaffaqiyatli yangilandi");
      setEditing(false);
      window.location.reload();
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Fanni o'chirishni tasdiqlaysizmi?");
    if (!confirmed) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("subjects").delete().eq("id", subject.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Fan o'chirildi");
      window.location.reload();
    }
  }

  if (editing) {
    return (
      <div className="flex gap-2 items-center min-w-[200px]">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Fan nomi"
          disabled={saving}
          className="h-8 text-sm"
        />
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "..." : "Saqlash"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditing(false);
            setName(subject.name);
          }}
          disabled={saving}
        >
          Bekor
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-1 shrink-0">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setEditing(true)}
        aria-label="Tahrirlash"
      >
        Tahrirlash
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleDelete}
        disabled={deleting}
        aria-label="O'chirish"
      >
        O'chirish
      </Button>
    </div>
  );
}
