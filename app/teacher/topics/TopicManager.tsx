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
  school_id?: string;
}

interface ClassItem {
  id: string;
  grade: number;
  letter: string;
  school_id: string;
}

interface TopicItem {
  id: string;
  name: string;
  fan_subject_id: string | null;
  fan_subject_name: string | null;
}

interface Props {
  subjects: Subject[];
  classes: ClassItem[];
  teacherTopics: TopicItem[];
}

export function TopicManager({ subjects, classes, teacherTopics }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [topics, setTopics] = useState<TopicItem[]>(teacherTopics);
  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const effectiveSubjectId = subjectId || subjects[0]?.id || "";

  const selectedSchoolId = subjects.find((subject) => subject.id === effectiveSubjectId)?.school_id ?? "";
  const filteredClasses = useMemo(
    () => (selectedSchoolId ? classes.filter((c) => c.school_id === selectedSchoolId) : classes),
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
    if (!effectiveSubjectId) { toast.error("Fan tanlang"); return; }
    if (!name.trim()) { toast.error("Mavzu nomini kiriting"); return; }
    if (selectedClassIds.length === 0) { toast.error("Kamida bitta sinf tanlang"); return; }

    const fd = new FormData();
    fd.set("name", name.trim());
    fd.set("subjectId", effectiveSubjectId);
    selectedClassIds.forEach((id) => fd.append("classIds", id));

    const selectedSubject = subjects.find((s) => s.id === effectiveSubjectId);

    startTransition(async () => {
      const result = await createTeacherTopicAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Mavzu qo'shildi");
        setName("");
        setSelectedClassIds([]);
        setIsCreateOpen(false);
        if (result.topic) {
          const newTopic: TopicItem = {
            id: result.topic.id,
            name: result.topic.name,
            fan_subject_id: result.topic.fan_subject_id ?? selectedSubject?.id ?? null,
            fan_subject_name: result.topic.fan_subject_name ?? selectedSubject?.name ?? null,
          };
          setTopics((prev) => (
            prev.some((item) => item.id === newTopic.id) ? prev : [...prev, newTopic]
          ));
        }
      }
    });
  }

  // Fan bo'yicha guruhlash
  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: TopicItem[] }>();
    for (const topic of topics) {
      const key = topic.fan_subject_id ?? "__none__";
      const label = topic.fan_subject_name ?? "Fansiz";
      if (!map.has(key)) map.set(key, { label, items: [] });
      map.get(key)!.items.push(topic);
    }
    return [...map.values()].sort((a, b) =>
      a.label === "Fansiz" ? 1 : b.label === "Fansiz" ? -1 : a.label.localeCompare(b.label)
    );
  }, [topics]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Mavzular ro&apos;yxati</CardTitle>
            <Button
              type="button"
              onClick={() => setIsCreateOpen((prev) => !prev)}
              variant={isCreateOpen ? "outline" : "default"}
            >
              {isCreateOpen ? "Bekor qilish" : "Qo'shish"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">Mavzular hali yo&apos;q.</p>
          ) : (
            <div className="space-y-5">
              {grouped.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    {group.label}
                  </p>
                  <ul className="space-y-1.5" role="list" aria-label={`${group.label} mavzulari`}>
                    {group.items.map((topic) => (
                      <li key={topic.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 shrink-0">
                          {topic.fan_subject_name ?? "—"}
                        </span>
                        <p className="font-medium text-sm">{topic.name}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isCreateOpen && (
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
                value={effectiveSubjectId}
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
      )}
    </div>
  );
}
