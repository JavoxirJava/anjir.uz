"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAssignmentAction } from "@/app/actions/assignments";
import { useFileUpload } from "@/hooks/useFileUpload";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentAIChat } from "./AssignmentAIChat";

interface TopicItem { id: string; name: string; subject_id: string; subject_name: string }
interface ClassItem { id: string; grade: number; letter: string }

type AssignmentMode = "regular" | "link";

export function NewAssignmentForm({
  topics,
  classes,
  initialTopicId,
}: {
  topics: TopicItem[];
  classes: ClassItem[];
  initialTopicId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<AssignmentMode>("regular");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkDescription, setLinkDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [topicId, setTopicId] = useState(initialTopicId ?? "");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"low" | "medium" | "high">("medium");
  const [isForDisabled, setIsForDisabled] = useState(false);
  const [descriptionPdfUrl, setDescriptionPdfUrl] = useState<string>("");
  const [link, setLink] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const { upload, progress, reset } = useFileUpload();

  const selectedClassNames = classes
    .filter((cls) => selectedClasses.includes(cls.id))
    .map((cls) => `${cls.grade}${cls.letter}`);

  const selectedSubjectName = topics.find((t) => t.id === topicId)?.name;

  function toggleClass(id: string) {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleModeChange(newMode: AssignmentMode) {
    setMode(newMode);
    setLink("");
    setLinkDescription("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isUploadingPdf) {
      toast.error("PDF yuklanishi tugashini kuting");
      return;
    }
    if (mode === "link" && !link.trim()) {
      toast.error("Tashqi havola kiritilishi shart");
      return;
    }
    const fd = new FormData(e.currentTarget);

    if (topicId) fd.set("topic_id", topicId);
    if (selectedClasses.length === 0) {
      toast.error("Kamida 1 ta sinf tanlang");
      return;
    }
    selectedClasses.forEach((c) => fd.append("classIds", c));
    fd.set("difficulty_level", difficulty);
    fd.set("is_for_disabled", String(isForDisabled));
    if (descriptionPdfUrl) fd.set("file_url", descriptionPdfUrl);

    if (mode === "link") {
      fd.set("link", link.trim());
      if (linkDescription.trim()) {
        const existing = fd.get("description");
        if (!existing) fd.set("description", linkDescription.trim());
      }
    } else {
      fd.delete("link");
    }

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

  async function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF fayl yuklash mumkin");
      return;
    }
    setIsUploadingPdf(true);
    const result = await upload(file, "assignments");
    setIsUploadingPdf(false);
    if (!result?.fileUrl) {
      toast.error("PDF yuklashda xatolik");
      return;
    }
    setDescriptionPdfUrl(result.fileUrl);
    toast.success("PDF muvaffaqiyatli yuklandi");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* Topshiriq turi */}
      <div
        className="flex rounded-lg border overflow-hidden"
        role="group"
        aria-label="Topshiriq turi"
      >
        <button
          type="button"
          role="radio"
          aria-checked={mode === "regular"}
          onClick={() => handleModeChange("regular")}
          className={`flex-1 py-2.5 px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            mode === "regular"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted text-muted-foreground"
          }`}
        >
          Oddiy topshiriq
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === "link"}
          onClick={() => handleModeChange("link")}
          className={`flex-1 py-2.5 px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring border-l ${
            mode === "link"
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted text-muted-foreground"
          }`}
        >
          Tashqi havola
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "regular" ? "Vazifa ma'lumotlari" : "Tashqi platforma topshirig'i"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sarlavha */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Sarlavha *</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vazifa sarlavhasi"
              required
              aria-required="true"
            />
          </div>

          {mode === "link" ? (
            <>
              {/* Tashqi havola */}
              <div className="space-y-1.5">
                <Label htmlFor="link_url">Havola *</Label>
                <Input
                  id="link_url"
                  type="url"
                  inputMode="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com/topshiriq"
                  required
                  aria-required="true"
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Tashqi platforma (Quizlet, Kahoot, Google Forms va boshqalar)
                </p>
              </div>

              {/* Qo'shimcha tavsif */}
              <div className="space-y-1.5">
                <Label htmlFor="link_description">Qo&apos;shimcha tavsif (ixtiyoriy)</Label>
                <Textarea
                  id="link_description"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder="O'quvchilarga qo'shimcha ko'rsatmalar..."
                  rows={3}
                />
              </div>
            </>
          ) : (
            <>
              {/* Tavsif */}
              <div className="space-y-1.5">
                <Label htmlFor="description">Tavsif / Ko&apos;rsatma (ixtiyoriy)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vazifa haqida batafsil ma'lumot..."
                  rows={4}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description_pdf">Tavsif PDF (ixtiyoriy)</Label>
                <Input
                  id="description_pdf"
                  name="description_pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  disabled={isPending || isUploadingPdf}
                />
                {isUploadingPdf && (
                  <p className="text-xs text-muted-foreground">
                    Yuklanmoqda... {progress.percent}%
                  </p>
                )}
                {descriptionPdfUrl && (
                  <div className="flex items-center gap-3 text-xs">
                    <a
                      href={descriptionPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Yuklangan PDF&apos;ni ko&apos;rish
                    </a>
                    <button
                      type="button"
                      className="text-destructive underline"
                      onClick={() => {
                        setDescriptionPdfUrl("");
                        reset();
                      }}
                    >
                      Olib tashlash
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mavzu */}
          <div className="space-y-1.5">
            <Label htmlFor="topic_id">Mavzu</Label>
            <select
              id="topic_id"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring bg-background"
            >
              <option value="">— Mavzu tanlang (ixtiyoriy) —</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.subject_name})</option>
              ))}
            </select>
          </div>

          {/* Muddati */}
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Topshirish muddati (ixtiyoriy)</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Daraja */}
          <fieldset>
            <legend className="text-sm font-medium mb-2">O&apos;quvchi darajasi *</legend>
            <div className="flex gap-2" role="radiogroup" aria-label="Daraja tanlang">
              {(["low", "medium", "high"] as const).map((level) => {
                const labels = { low: "Quyi", medium: "Oʻrta", high: "Yuqori" };
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

    <div className="lg:sticky lg:top-6">
      <AssignmentAIChat
        subjectName={selectedSubjectName}
        selectedClassNames={selectedClassNames}
        draft={{
          title,
          description,
          deadline,
          difficulty_level: difficulty,
          is_for_disabled: isForDisabled,
        }}
        onApplyPatch={(patch) => {
          if (typeof patch.title === "string") setTitle(patch.title);
          if (typeof patch.description === "string") setDescription(patch.description);
          if (typeof patch.deadline === "string" || patch.deadline === null) setDeadline(patch.deadline ?? "");
          if (patch.difficulty_level === "low" || patch.difficulty_level === "medium" || patch.difficulty_level === "high") {
            setDifficulty(patch.difficulty_level);
          }
          if (typeof patch.is_for_disabled === "boolean") setIsForDisabled(patch.is_for_disabled);
        }}
      />
    </div>
    </div>
  );
}
