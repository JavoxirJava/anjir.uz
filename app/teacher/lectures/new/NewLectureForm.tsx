"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { lectureSchema, type LectureInput } from "@/lib/validations/lecture";
import { createLectureAction } from "@/app/actions/lectures";
import { uz } from "@/lib/strings/uz";
import { FileUploadField } from "@/components/lectures/FileUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Subject { id: string; name: string }
interface ClassItem { id: string; grade: number; letter: string }

const CONTENT_TYPES = [
  { value: "pdf", label: uz.lectures.pdf, accept: "application/pdf", maxMb: 5 },
  { value: "video", label: uz.lectures.video, accept: "video/mp4,video/webm", maxMb: 100 },
  { value: "audio", label: uz.lectures.audio, accept: "audio/mpeg,audio/mp4,audio/ogg", maxMb: 20 },
  { value: "ppt", label: uz.lectures.ppt, accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation", maxMb: 10 },
] as const;

interface Props {
  subjects: Subject[];
  classes: ClassItem[];
}

export function NewLectureForm({ subjects, classes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isGeneratingSubtitle, setIsGeneratingSubtitle] = useState(false);

  const form = useForm<LectureInput>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title: "",
      description: "",
      subjectId: "",
      classId: "",
      contentType: "pdf",
      fileUrl: "",
    },
  });

  const contentType = form.watch("contentType");
  const fileUrl = form.watch("fileUrl");
  const selectedType = CONTENT_TYPES.find((t) => t.value === contentType);

  async function generateSubtitle() {
    if (!fileUrl) return;
    setIsGeneratingSubtitle(true);
    try {
      const res = await fetch("/api/whisper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: fileUrl, lectureId: "temp" }),
      });
      const data = await res.json();
      if (data.vttUrl) {
        form.setValue("subtitleVttUrl", data.vttUrl);
        form.setValue("subtitleSource", "ai");
        toast.success("Subtitr muvaffaqiyatli yaratildi");
      }
    } catch {
      toast.error("Subtitr yaratishda xatolik");
    } finally {
      setIsGeneratingSubtitle(false);
    }
  }

  function onSubmit(values: LectureInput) {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== "") fd.set(k, String(v));
      });
      const result = await createLectureAction(fd);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-label={uz.teacher.addLecture}>
          <CardContent className="pt-6 space-y-5">

            {/* Sarlavha */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{uz.common.name} <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input aria-required="true" placeholder="Ma'ruza sarlavhasi..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tavsif */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{uz.common.description}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Qisqacha tavsif..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Fan */}
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{uz.school.subject} <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger aria-required="true">
                          <SelectValue placeholder="Fan tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sinf */}
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{uz.school.className}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Barcha sinflar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Barcha sinflar</SelectItem>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.grade}-sinf {c.letter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Kontent turi */}
            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{uz.lectures.title} turi <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                  <div
                    role="radiogroup"
                    aria-label="Kontent turini tanlang"
                    className="flex flex-wrap gap-2"
                  >
                    {CONTENT_TYPES.map((t) => (
                      <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contentType"
                          value={t.value}
                          checked={field.value === t.value}
                          onChange={() => {
                            field.onChange(t.value);
                            form.setValue("fileUrl", "");
                          }}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`rounded-md border px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                            field.value === t.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          {t.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fayl yuklash */}
            {selectedType && (
              <FormField
                control={form.control}
                name="fileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedType.label} fayli{" "}
                      <span aria-hidden="true" className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        {/* Hidden input to hold the fileUrl value for the form */}
                        <input type="hidden" {...field} />
                        <FileUploadField
                          accept={selectedType.accept}
                          maxSizeMb={selectedType.maxMb}
                          label={`${selectedType.label} yuklash`}
                          onUploaded={(url) => form.setValue("fileUrl", url, { shouldValidate: true })}
                          folder="lectures"
                          required
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Video/Audio uchun subtitr */}
            {(contentType === "video" || contentType === "audio") && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    {uz.lectures.subtitles}
                    {contentType === "video" && (
                      <span className="ml-1 text-destructive text-xs">({uz.lectures.subtitlesRequired})</span>
                    )}
                  </h3>

                  {/* AI subtitr generatsiya */}
                  {fileUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isGeneratingSubtitle}
                      onClick={generateSubtitle}
                      aria-busy={isGeneratingSubtitle}
                    >
                      {isGeneratingSubtitle ? uz.common.loading : uz.lectures.generateSubtitles}
                    </Button>
                  )}

                  {/* Qo'lda VTT yuklash */}
                  <FormField
                    control={form.control}
                    name="subtitleVttUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{uz.lectures.addSubtitles} (VTT fayl)</FormLabel>
                        <FormControl>
                          <div>
                            <input type="hidden" {...field} />
                            <FileUploadField
                              accept="text/vtt,.vtt"
                              maxSizeMb={1}
                              label="VTT subtitr fayli"
                              onUploaded={(url) => {
                                form.setValue("subtitleVttUrl", url);
                                form.setValue("subtitleSource", "manual");
                              }}
                              folder="subtitles"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("subtitleVttUrl") && (
                    <p className="text-xs text-green-600" role="status" aria-live="polite">
                      ✓ Subtitr tayyor: {form.watch("subtitleSource") === "ai" ? "AI tomonidan" : "Qo'lda yuklangan"}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <div className="flex items-center gap-3 px-6 pb-6">
            <Button
              type="submit"
              disabled={isPending || !form.watch("fileUrl")}
              aria-busy={isPending}
            >
              {isPending ? uz.common.loading : uz.common.save}
            </Button>
            <a
              href="/teacher/lectures"
              className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2"
            >
              {uz.common.cancel}
            </a>
          </div>
        </form>
      </Form>
    </Card>
  );
}
