"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { lectureSchema, type LectureInput } from "@/lib/validations/lecture";
import { updateLectureAction } from "@/app/actions/lectures";
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
  lectureId: string;
  subjects: Subject[];
  classes: ClassItem[];
  initial: {
    title: string;
    description: string;
    subjectId: string;
    classId: string;
    contentType: "pdf" | "video" | "audio" | "ppt";
    fileUrl: string;
    subtitleVttUrl: string;
    subtitleSource: "manual" | "ai" | "";
  };
}

export function EditLectureForm({ lectureId, subjects, classes, initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isGeneratingSubtitle, setIsGeneratingSubtitle] = useState(false);

  const form = useForm<LectureInput>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title: initial.title,
      description: initial.description,
      subjectId: initial.subjectId,
      classId: initial.classId,
      contentType: initial.contentType,
      fileUrl: initial.fileUrl,
      subtitleVttUrl: initial.subtitleVttUrl || undefined,
      subtitleSource: (initial.subtitleSource || undefined) as "manual" | "ai" | undefined,
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
        body: JSON.stringify({ audioUrl: fileUrl, lectureId }),
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
      const result = await updateLectureAction(lectureId, fd);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate aria-label="Ma'ruzani tahrirlash">
          <CardContent className="pt-6 space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{uz.common.name}</FormLabel>
                  <FormControl><Input aria-required="true" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{uz.common.description}</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{uz.school.subject}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Fan tanlang">
                            {field.value
                              ? (subjects.find((s) => s.id === field.value)?.name ?? "Fan tanlang")
                              : "Fan tanlang"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>{subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{uz.school.className}</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v === "__all__" ? "" : v)} value={field.value || "__all__"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Barcha sinflar">
                            {field.value
                              ? (() => {
                                  const c = classes.find((cl) => cl.id === field.value);
                                  return c ? `${c.grade}-sinf ${c.letter}` : "Barcha sinflar";
                                })()
                              : "Barcha sinflar"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__all__">Barcha sinflar</SelectItem>
                        {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.grade}-sinf {c.letter}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontent turi</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map((t) => (
                      <label key={t.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="contentType"
                          value={t.value}
                          checked={field.value === t.value}
                          onChange={() => field.onChange(t.value)}
                          className="sr-only"
                        />
                        <span className={`rounded-md border px-3 py-1.5 text-sm ${field.value === t.value ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                          {t.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            {selectedType && (
              <FormField
                control={form.control}
                name="fileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{selectedType.label} fayli</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input type="hidden" {...field} value={field.value ?? ""} />
                        <FileUploadField
                          accept={selectedType.accept}
                          maxSizeMb={selectedType.maxMb}
                          label={`${selectedType.label} yuklash`}
                          onUploaded={(url) => {
                            form.setValue("fileUrl", url, { shouldValidate: true });
                          }}
                          folder="lectures"
                        />
                        {field.value && (
                          <p className="text-xs text-muted-foreground">
                            Hozirgi fayl mavjud:{" "}
                            <a
                              href={field.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-primary"
                            >
                              ochish
                            </a>
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(contentType === "video" || contentType === "audio") && (
              <>
                <Separator />
                <div className="space-y-3">
                  {fileUrl && (
                    <Button type="button" variant="outline" size="sm" disabled={isGeneratingSubtitle} onClick={generateSubtitle}>
                      {isGeneratingSubtitle ? uz.common.loading : uz.lectures.generateSubtitles}
                    </Button>
                  )}

                  <FormField
                    control={form.control}
                    name="subtitleVttUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitr (VTT)</FormLabel>
                        <FormControl>
                          <div>
                            <input type="hidden" {...field} value={field.value ?? ""} />
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
                            {field.value && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Hozirgi VTT mavjud:{" "}
                                <a
                                  href={field.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-primary"
                                >
                                  ochish
                                </a>
                              </p>
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}
          </CardContent>

          <div className="flex items-center gap-3 px-6 pb-6">
            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? uz.common.loading : uz.common.save}
            </Button>
            <a href="/teacher/lectures" className="text-sm text-muted-foreground hover:text-foreground">
              {uz.common.cancel}
            </a>
          </div>
        </form>
      </Form>
    </Card>
  );
}
