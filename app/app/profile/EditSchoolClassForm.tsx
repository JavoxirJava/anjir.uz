"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateStudentClassAction } from "@/app/actions/student";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface School {
  id: string;
  name: string;
}

interface ClassItem {
  id: string;
  grade: number;
  letter: string;
}

interface Props {
  schools: School[];
  currentClassId?: string | null;
  currentSchoolId?: string | null;
}

export function EditSchoolClassForm({ schools, currentClassId, currentSchoolId }: Props) {
  const [editing, setEditing] = useState(!currentClassId); // agar sinf yo'q bo'lsa avtomatik ochiq
  const [isPending, startTransition] = useTransition();

  const [schoolId, setSchoolId] = useState(currentSchoolId ?? "");
  const [classId, setClassId] = useState(currentClassId ?? "");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (!schoolId) { setClasses([]); setClassId(""); return; }
    setLoadingClasses(true);
    const supabase = createClient();
    supabase
      .from("classes")
      .select("id, grade, letter")
      .eq("school_id", schoolId)
      .order("grade").order("letter")
      .then(({ data }) => {
        setClasses(data ?? []);
        setLoadingClasses(false);
      });
  }, [schoolId]);

  function handleSchoolChange(v: string | null) {
    setSchoolId(v ?? "");
    setClassId("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classId) { toast.error("Sinf tanlanishi shart"); return; }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("classId", classId);
      const result = await updateStudentClassAction(fd);
      if (result?.error) toast.error(result.error);
      // muvaffaqiyatli bo'lsa redirect("/pending") ishlaydi server tomondan
    });
  }

  const selectedClass = classes.find((c) => c.id === classId);
  const selectedSchool = schools.find((s) => s.id === schoolId);

  if (!editing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditing(true)}
        className="mt-3"
      >
        ✏️ Maktab / sinfni o&apos;zgartirish
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border bg-muted/30 p-4">
      <p className="text-sm font-semibold">
        {currentClassId ? "Maktab / sinfni o'zgartirish" : "Maktab va sinf tanlang"}
      </p>
      {currentClassId && (
        <p className="text-xs text-muted-foreground">
          Sinf o&apos;zgartirilsa, direktor qayta tasdiqlashi kerak bo&apos;ladi.
        </p>
      )}

      {/* Maktab */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-school">Maktab</Label>
        <Select value={schoolId} onValueChange={handleSchoolChange} disabled={isPending}>
          <SelectTrigger id="edit-school">
            <SelectValue placeholder="Maktab tanlang">
              {selectedSchool ? selectedSchool.name : "Maktab tanlang"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {schools.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sinf */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-class">Sinf</Label>
        <Select
          value={classId}
          onValueChange={(v: string | null) => setClassId(v ?? "")}
          disabled={!schoolId || loadingClasses || isPending}
        >
          <SelectTrigger id="edit-class">
            <SelectValue placeholder={loadingClasses ? "Yuklanmoqda..." : "Sinf tanlang"}>
              {selectedClass
                ? `${selectedClass.grade}-sinf ${selectedClass.letter}`
                : loadingClasses ? "Yuklanmoqda..." : "Sinf tanlang"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.grade}-sinf {c.letter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={isPending || !classId}>
          {isPending ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
        {currentClassId && (
          <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={isPending}>
            Bekor qilish
          </Button>
        )}
      </div>
    </form>
  );
}
