"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { lectureSchema, type LectureInput } from "@/lib/validations/lecture";
import { createLectureAction } from "@/app/actions/lectures";
import { uz } from "@/lib/strings/uz";
import { FileUploadField } from "@/components/lectures/FileUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TopicItem { id: string; name: string; subject_id: string; subject_name: string }
interface ClassItem { id: string; grade: number; letter: string; school_id: string }

type Mode = "platform" | "external";

const CONTENT_TYPES = [
  { value: "pdf", label: uz.lectures.pdf, accept: "application/pdf", maxMb: 5 },
  { value: "video", label: uz.lectures.video, accept: "video/mp4,video/webm", maxMb: 100 },
  { value: "audio", label: uz.lectures.audio, accept: "audio/mpeg,audio/mp4,audio/ogg", maxMb: 20 },
  { value: "ppt", label: uz.lectures.ppt, accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation", maxMb: 10 },
] as const;

interface Props {
  topics: TopicItem[];
  classes: ClassItem[];
}

export function NewLectureForm({ topics, classes }: Props) {
  const [mode, setMode] = useState<Mode>("platform");
  const [isPending, startTransition] = useTransition();

  // --- Platform mode ---
  const [isGeneratingSubtitle, setIsGeneratingSubtitle] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  const form = useForm<LectureInput>({
    resolver: zodResolver(lectureSchema),
    defaultValues: { title: "", description: "", topicId: "", classId: "", contentType: "pdf", fileUrl: "" },
  });

  const contentType = useWatch({ control: form.control, name: "contentType" });
  const fileUrl = useWatch({ control: form.control, name: "fileUrl" });
  const subtitleVttUrl = useWatch({ control: form.control, name: "subtitleVttUrl" });
  const subtitleSource = useWatch({ control: form.control, name: "subtitleSource" });

  const selectedType = CONTENT_TYPES.find((t) => t.value === contentType);

  // --- External mode ---
  const [extTopicId, setExtTopicId] = useState("");
  const [extClassId, setExtClassId] = useState("");
  const [extTitle, setExtTitle] = useState("");
  const [extLink, setExtLink] = useState("");

  const extClasses = classes;

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

  function onPlatformSubmit(values: LectureInput) {
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== "") fd.set(k, String(v));
      });
      const result = await createLectureAction(fd);
      if (result?.error) toast.error(result.error);
    });
  }

  function onExternalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!extTopicId) { toast.error("Mavzu tanlanishi shart"); return; }
    if (!extClassId) { toast.error("Sinf tanlanishi shart"); return; }
    if (!extLink.trim()) { toast.error("Havola kiritilishi shart"); return; }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("topicId", extTopicId);
      fd.set("classId", extClassId);
      fd.set("contentType", "link");
      fd.set("fileUrl", extLink.trim());
      if (extTitle.trim()) fd.set("title", extTitle.trim());
      const result = await createLectureAction(fd);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="space-y-4">
      {/* Rejim tugmalari */}
      <div className="flex rounded-lg border overflow-hidden" role="group" aria-label="Qo'shish turi">
        <button
          type="button"
          role="radio"
          aria-checked={mode === "platform"}
          onClick={() => setMode("platform")}
          className={`flex-1 py-2.5 px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            mode === "platform" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground"
          }`}
        >
          Shu platformaga qo&apos;shish
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === "external"}
          onClick={() => setMode("external")}
          className={`flex-1 py-2.5 px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring border-l ${
            mode === "external" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground"
          }`}
        >
          Tashqi havola
        </button>
      </div>

      {/* ===== PLATFORM MODE ===== */}
      {mode === "platform" && (
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onPlatformSubmit)} noValidate aria-label={uz.teacher.addLecture}>
              <CardContent className="pt-6 space-y-5">

                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{uz.common.name} <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input aria-required="true" placeholder="Ma'ruza sarlavhasi..." {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{uz.common.description}</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Qisqacha tavsif..." className="resize-none" rows={3} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="topicId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mavzu <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={(v) => { field.onChange(v); form.setValue("classId", ""); }} value={field.value}>
                        <FormControl>
                          <SelectTrigger aria-required="true">
                            <SelectValue placeholder="Mavzu tanlang">
                              {field.value ? topics.find((t) => t.id === field.value)?.name : undefined}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topics.length === 0
                            ? <div className="px-3 py-2 text-sm text-muted-foreground">Avval mavzu yarating</div>
                            : topics.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name} <span className="text-muted-foreground text-xs">({t.subject_name})</span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="classId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{uz.school.className}</FormLabel>
                      <Select onValueChange={(v) => field.onChange(v === "__all__" ? "" : v)} value={field.value || "__all__"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Barcha sinflar">
                              {field.value ? (() => { const c = classes.find((cl) => cl.id === field.value); return c ? `${c.grade}-sinf ${c.letter}` : "Barcha sinflar"; })() : undefined}
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
                  )} />
                </div>

                <Separator />

                <FormField control={form.control} name="contentType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{uz.lectures.title} turi <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                    <div role="radiogroup" aria-label="Kontent turini tanlang" className="flex flex-wrap gap-2">
                      {CONTENT_TYPES.map((t) => (
                        <label key={t.value} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="contentType" value={t.value} checked={field.value === t.value}
                            onChange={() => { field.onChange(t.value); form.setValue("fileUrl", ""); setHasFile(false); }}
                            className="sr-only"
                          />
                          <span aria-hidden="true" className={`rounded-md border px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
                            field.value === t.value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                          }`}>{t.label}</span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                {selectedType && (
                  <FormField control={form.control} name="fileUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{selectedType.label} fayli <span aria-hidden="true" className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div>
                          <input type="hidden" {...field} value={field.value ?? ""} />
                          <FileUploadField
                            accept={selectedType.accept}
                            maxSizeMb={selectedType.maxMb}
                            label={`${selectedType.label} yuklash`}
                            onUploaded={(url) => { form.setValue("fileUrl", url, { shouldValidate: true }); setHasFile(true); }}
                            folder="lectures"
                            required
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {(contentType === "video" || contentType === "audio") && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">
                        {uz.lectures.subtitles}
                        {contentType === "video" && <span className="ml-1 text-destructive text-xs">({uz.lectures.subtitlesRequired})</span>}
                      </h3>
                      {fileUrl && (
                        <Button type="button" variant="outline" size="sm" disabled={isGeneratingSubtitle} onClick={generateSubtitle} aria-busy={isGeneratingSubtitle}>
                          {isGeneratingSubtitle ? uz.common.loading : uz.lectures.generateSubtitles}
                        </Button>
                      )}
                      <FormField control={form.control} name="subtitleVttUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{uz.lectures.addSubtitles} (VTT fayl)</FormLabel>
                          <FormControl>
                            <div>
                              <input type="hidden" {...field} value={field.value ?? ""} />
                              <FileUploadField accept="text/vtt,.vtt" maxSizeMb={1} label="VTT subtitr fayli"
                                onUploaded={(url) => { form.setValue("subtitleVttUrl", url); form.setValue("subtitleSource", "manual"); }}
                                folder="subtitles"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      {subtitleVttUrl && (
                        <p className="text-xs text-green-600" role="status" aria-live="polite">
                          ✓ Subtitr tayyor: {subtitleSource === "ai" ? "AI tomonidan" : "Qo'lda yuklangan"}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>

              <div className="flex items-center gap-3 px-6 pb-6">
                <Button type="submit" disabled={isPending || !hasFile} aria-busy={isPending}>
                  {isPending ? uz.common.loading : uz.common.save}
                </Button>
                <a href="/teacher/lectures" className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2">
                  {uz.common.cancel}
                </a>
              </div>
            </form>
          </Form>
        </Card>
      )}

      {/* ===== EXTERNAL MODE ===== */}
      {mode === "external" && (
        <Card>
          <form onSubmit={onExternalSubmit} noValidate>
            <CardContent className="pt-6 space-y-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ext-topic">
                    Mavzu <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Select value={extTopicId} onValueChange={(v) => { setExtTopicId(v ?? ""); setExtClassId(""); }}>
                    <SelectTrigger id="ext-topic" aria-required="true">
                      <SelectValue placeholder="Mavzu tanlang">
                        {extTopicId ? topics.find((t) => t.id === extTopicId)?.name : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {topics.length === 0
                        ? <div className="px-3 py-2 text-sm text-muted-foreground">Avval mavzu yarating</div>
                        : topics.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} <span className="text-xs text-muted-foreground">({t.subject_name})</span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ext-class">
                    {uz.school.className} <span aria-hidden="true" className="text-destructive">*</span>
                  </Label>
                  <Select value={extClassId} onValueChange={(v) => setExtClassId(v ?? "")} disabled={!extTopicId}>
                    <SelectTrigger id="ext-class" aria-required="true" aria-disabled={!extTopicId}>
                      <SelectValue placeholder={extTopicId ? "Sinf tanlang" : "Avval mavzu tanlang"}>
                        {extClassId ? (() => { const c = extClasses.find((cl) => cl.id === extClassId); return c ? `${c.grade}-sinf ${c.letter}` : undefined; })() : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {extClasses.map((c) => <SelectItem key={c.id} value={c.id}>{c.grade}-sinf {c.letter}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ext-link">
                  Tashqi havola <span aria-hidden="true" className="text-destructive">*</span>
                </Label>
                <Input
                  id="ext-link"
                  type="url"
                  inputMode="url"
                  value={extLink}
                  onChange={(e) => setExtLink(e.target.value)}
                  placeholder="https://example.com/material"
                  required
                  aria-required="true"
                />
                <p className="text-xs text-muted-foreground">
                  Tashqi platforma (YouTube, Quizlet, Google Sites va boshqalar)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ext-title">Sarlavha (ixtiyoriy)</Label>
                <Input
                  id="ext-title"
                  value={extTitle}
                  onChange={(e) => setExtTitle(e.target.value)}
                  placeholder="Masalan: 8-sinf Fotosintez videosi"
                />
              </div>

            </CardContent>

            <div className="flex items-center gap-3 px-6 pb-6">
              <Button type="submit" disabled={isPending} aria-busy={isPending}>
                {isPending ? uz.common.loading : uz.common.save}
              </Button>
              <a href="/teacher/lectures" className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2">
                {uz.common.cancel}
              </a>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
