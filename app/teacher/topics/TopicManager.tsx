"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createTeacherTopicAction } from "@/app/actions/teacher-topics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Subject {
  id: string;
  name: string;
  school_id: string;
}

interface ClassItem {
  id: string;
  grade: number;
  letter: string;
  school_id: string;
}

interface Props {
  subjects: Subject[];
  classes: ClassItem[];
}

export function TopicManager({ subjects, classes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  const selectedSchoolId = subjects.find((subject) => subject.id === subjectId)?.school_id ?? "";
  const filteredClasses = useMemo(
    () => classes.filter((c) => c.school_id === selectedSchoolId),
    [classes, selectedSchoolId]
  );

  function handleSubjectChange(nextSubjectId: string) {
    setSubjectId(nextSubjectId);
    setSelectedClassIds([]);
  }

  function toggleClass(id: string) {
    setSelectedClassIds((prev) => (
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    ));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subjectId) { toast.error("Fan tanlang"); return; }
    if (!name.trim()) { toast.error("Mavzu nomini kiriting"); return; }
    if (selectedClassIds.length === 0) { toast.error("Kamida bitta sinf tanlang"); return; }

    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("subjectId", subjectId);
    selectedClassIds.forEach((id) => fd.append("classIds", id));

    startTransition(async () => {
      const result = await createTeacherTopicAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Mavzu qo'shildi");
        setName("");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Yangi mavzu qo&apos;shish</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="topic-name">Mavzu nomi</Label>
              <Input
                id="topic-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Kasrlarni qo'shish"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="topic-subject">Fan</Label>
              <select
                id="topic-subject"
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <option value="">Fan tanlang</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="text-sm font-medium mb-2">Sinf(lar)</legend>
              {filteredClasses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tanlangan fan uchun sinf topilmadi.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredClasses.map((c) => {
                    const selected = selectedClassIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleClass(c.id)}
                        className={`rounded-md border px-3 py-1.5 text-sm ${
                          selected ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                        }`}
                      >
                        {c.grade}-{c.letter}
                      </button>
                    );
                  })}
                </div>
              )}
            </fieldset>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saqlanmoqda..." : "Mavzu qo'shish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
