"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAssignmentAction } from "@/app/actions/assignments";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subject { id: string; name: string }
interface ClassItem { id: string; grade: number; letter: string }

export function NewAssignmentForm({
  subjects,
  classes,
}: {
  subjects: Subject[];
  classes: ClassItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"low" | "medium" | "high">("medium");
  const [isForDisabled, setIsForDisabled] = useState(false);

  function toggleClass(id: string) {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (!fd.get("subject_id")) {
      toast.error("Fan tanlanishi shart");
      return;
    }
    if (selectedClasses.length === 0) {
      toast.error("Kamida 1 ta sinf tanlang");
      return;
    }
    selectedClasses.forEach((c) => fd.append("classIds", c));
    fd.set("difficulty_level", difficulty);
    fd.set("is_for_disabled", String(isForDisabled));

    startTransition(async () => {
      const result = await createAssignmentAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Vazifa yaratildi!");
        router.push("/teacher/assignments");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Vazifa ma&apos;lumotlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sarlavha */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Sarlavha *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Vazifa sarlavhasi"
              required
              aria-required="true"
            />
          </div>

          {/* Tavsif */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Tavsif / Ko&apos;rsatma (ixtiyoriy)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Vazifa haqida batafsil ma'lumot..."
              rows={4}
            />
          </div>

          {/* Fan */}
          <div className="space-y-1.5">
            <Label htmlFor="subject_id">Fan *</Label>
            <select
              id="subject_id"
              name="subject_id"
              required
              aria-required="true"
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring bg-background"
            >
              <option value="">— Fan tanlang —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Muddati */}
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Topshirish muddati (ixtiyoriy)</Label>
            <Input
              id="deadline"
              name="deadline"
              type="datetime-local"
              className="w-full"
            />
          </div>

          {/* Daraja */}
          <fieldset>
            <legend className="text-sm font-medium mb-2">O&apos;quvchi darajasi *</legend>
            <div className="flex gap-2" role="radiogroup" aria-label="Daraja tanlang">
              {(["low", "medium", "high"] as const).map((level) => {
                const labels = { low: "Past", medium: "Oʻrta", high: "Yuqori" };
                return (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={difficulty === level}
                    onClick={() => setDifficulty(level)}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors focus-visible:outline-2 ${
                      difficulty === level
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {labels[level]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Imkoniyati cheklangan */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="checkbox"
              id="is_for_disabled"
              aria-checked={isForDisabled}
              onClick={() => setIsForDisabled((v) => !v)}
              className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isForDisabled ? "border-primary bg-primary" : "border-border"
              }`}
              aria-label="Imkoniyati cheklangan o'quvchilar uchun"
            >
              {isForDisabled && (
                <svg viewBox="0 0 12 12" className="h-3 w-3 text-primary-foreground" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <Label htmlFor="is_for_disabled" className="cursor-pointer select-none">
              Imkoniyati cheklangan o&apos;quvchilar uchun
            </Label>
          </div>

          {/* Sinflar */}
          <fieldset>
            <legend className="text-sm font-medium mb-2">Sinflar *</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Sinflar ro'yxati">
              {classes.map((cls) => {
                const isSelected = selectedClasses.includes(cls.id);
                return (
                  <button
                    key={cls.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggleClass(cls.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 ${
                      isSelected
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {cls.grade}{cls.letter}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/teacher/assignments")}
          disabled={isPending}
        >
          {uz.common.cancel}
        </Button>
        <Button type="submit" disabled={isPending} aria-busy={isPending}>
          {isPending ? uz.common.loading : "Vazifa yaratish"}
        </Button>
      </div>
    </form>
  );
}
