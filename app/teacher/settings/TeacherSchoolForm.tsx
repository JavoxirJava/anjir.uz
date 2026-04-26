"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api/browser";
import { addTeacherAssignmentAction, removeTeacherSchoolAction } from "@/app/actions/teacher";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface School { id: string; name: string }
interface Subject { id: string; name: string }
interface ClassItem { id: string; grade: number; letter: string }
interface AssignedSchool {
  id: string;
  name: string;
  classes: { grade: number; letter: string }[];
}

interface Props {
  schools: School[];
  subjects: Subject[];
  assigned: AssignedSchool[];
}

export function TeacherSchoolForm({ schools, subjects, assigned }: Props) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [schoolId, setSchoolId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (!schoolId) { setClasses([]); setSelectedClassIds([]); return; }
    setLoadingClasses(true);
    apiGet<ClassItem[]>(`/classes?school_id=${schoolId}`)
      .then((data) => { setClasses(data); setLoadingClasses(false); })
      .catch(() => { setClasses([]); setLoadingClasses(false); });
  }, [schoolId]);

  function toggleClass(id: string) {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId)  { toast.error("Maktab tanlang"); return; }
    if (!subjectId) { toast.error("Fan tanlang"); return; }
    if (selectedClassIds.length === 0) { toast.error("Kamida bitta sinf tanlang"); return; }

    startTransition(async () => {
      const fd = new FormData();
      fd.set("schoolId",  schoolId);
      fd.set("subjectId", subjectId);
      selectedClassIds.forEach((id) => fd.append("classIds", id));
      const result = await addTeacherAssignmentAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Saqlandi");
        setAdding(false);
        setSchoolId("");
        setSubjectId("");
        setSelectedClassIds([]);
      }
    });
  }

  function handleRemove(sid: string) {
    startTransition(async () => {
      const result = await removeTeacherSchoolAction(sid);
      if (result?.error) toast.error(result.error);
      else toast.success("Maktab o'chirildi");
    });
  }

  const selectedSchool   = schools.find((s) => s.id === schoolId);
  const selectedSubject  = subjects.find((s) => s.id === subjectId);

  return (
    <div className="space-y-4">
      {/* Assigned schools list */}
      {assigned.length > 0 && (
        <ul className="space-y-3">
          {assigned.map((sch) => {
            const sorted = sch.classes
              .slice()
              .sort((a, b) => a.grade - b.grade || a.letter.localeCompare(b.letter));
            return (
              <li key={sch.id} className="rounded-xl border p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{sch.name}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
                    disabled={isPending}
                    onClick={() => handleRemove(sch.id)}
                  >
                    Chiqish
                  </Button>
                </div>
                {sorted.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sorted.map((c, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                      >
                        {c.grade}-sinf {c.letter}
                      </span>
                    ))}
                  </div>
                )}
                {/* Edit classes for this school */}
                <button
                  type="button"
                  className="text-xs text-primary underline underline-offset-2"
                  onClick={() => { setSchoolId(sch.id); setAdding(true); }}
                >
                  Sinflarni o&apos;zgartirish
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add button */}
      {!adding ? (
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          + Maktab qo&apos;shish
        </Button>
      ) : (
        <form onSubmit={handleAdd} className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm font-semibold">
            {assigned.find((s) => s.id === schoolId) ? "Sinflarni yangilash" : "Yangi maktab qo'shish"}
          </p>

          {/* Maktab */}
          <div className="space-y-1.5">
            <Label htmlFor="ts-school">Maktab</Label>
            <Select
              value={schoolId}
              onValueChange={(v: string | null) => { setSchoolId(v ?? ""); setSelectedClassIds([]); }}
              disabled={isPending}
            >
              <SelectTrigger id="ts-school">
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

          {/* Fan */}
          <div className="space-y-1.5">
            <Label htmlFor="ts-subject">Fan</Label>
            <Select
              value={subjectId}
              onValueChange={(v: string | null) => setSubjectId(v ?? "")}
              disabled={isPending}
            >
              <SelectTrigger id="ts-subject">
                <SelectValue placeholder="Fan tanlang">
                  {selectedSubject ? selectedSubject.name : "Fan tanlang"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sinflar */}
          {schoolId && (
            <div className="space-y-1.5">
              <Label>Sinflar (bir yoki bir nechta)</Label>
              {loadingClasses ? (
                <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
              ) : classes.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Bu maktabda sinflar yo&apos;q — direktor sinf qo&apos;shishi kerak.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 rounded-xl border bg-background p-3">
                  {classes.map((c) => {
                    const checked = selectedClassIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-1.5 cursor-pointer rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                          checked ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleClass(c.id)}
                          disabled={isPending}
                          className="accent-primary"
                        />
                        {c.grade}{c.letter}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" disabled={isPending || !schoolId || !subjectId || selectedClassIds.length === 0}>
              {isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
            <Button
              type="button" size="sm" variant="outline"
              onClick={() => { setAdding(false); setSchoolId(""); setSubjectId(""); setSelectedClassIds([]); }}
              disabled={isPending}
            >
              Bekor qilish
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
