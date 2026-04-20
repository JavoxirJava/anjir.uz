"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface School {
  id: string;
  name: string;
  address: string | null;
}

interface Props {
  school: School;
}

export function SchoolActions({ school }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(school.name);
  const [address, setAddress] = useState(school.address ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Maktab nomi kiritilishi shart");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("schools")
      .update({ name: name.trim(), address: address.trim() || null })
      .eq("id", school.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Maktab muvaffaqiyatli yangilandi");
      setEditing(false);
      window.location.reload();
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Maktabni o'chirishni tasdiqlaysizmi?");
    if (!confirmed) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("schools").delete().eq("id", school.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Maktab o'chirildi");
      window.location.reload();
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 min-w-[260px]">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Maktab nomi"
          disabled={saving}
        />
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Manzil (ixtiyoriy)"
          disabled={saving}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(false);
              setName(school.name);
              setAddress(school.address ?? "");
            }}
            disabled={saving}
          >
            Bekor qilish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setEditing(true)}
        aria-label="Tahrirlash"
      >
        ✏️
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleDelete}
        disabled={deleting}
        aria-label="O'chirish"
      >
        🗑️
      </Button>
    </div>
  );
}
