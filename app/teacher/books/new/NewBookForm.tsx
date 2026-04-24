"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBookAction } from "@/app/actions/books";
import { FileUploadField } from "@/components/lectures/FileUploadField";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subject { id: string; name: string }
interface ClassItem { id: string; grade: number; letter: string }

type AudioMode = "none" | "upload" | "ai";

export function NewBookForm({
  subjects,
  classes,
}: {
  subjects: Subject[];
  classes: ClassItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioMode, setAudioMode] = useState<AudioMode>("none");

  function toggleClass(id: string) {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pdfUrl) { toast.error("PDF fayl yuklang"); return; }
    if (selectedClasses.length === 0) { toast.error("Kamida 1 ta sinf tanlang"); return; }
    if (audioMode === "upload" && !audioUrl) { toast.error("Audio fayl yuklang yoki 'AI yaratsin' tanlang"); return; }

    const fd = new FormData(e.currentTarget);
    fd.append("pdf_url", pdfUrl);

    if (audioMode === "upload" && audioUrl) {
      fd.append("audio_url", audioUrl);
      fd.append("audio_source", "uploaded");
    } else if (audioMode === "ai") {
      fd.append("audio_source", "google_tts");
    }

    selectedClasses.forEach((c) => fd.append("classIds", c));

    startTransition(async () => {
      const result = await createBookAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Kitob qo'shildi! 🎉");
        router.push("/teacher/books");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Asosiy ma'lumotlar */}
      <Card>
        <CardHeader>
          <CardTitle>Kitob ma&apos;lumotlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Sarlavha *</Label>
            <Input id="title" name="title" placeholder="Kitob nomi" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="author">Muallif (ixtiyoriy)</Label>
            <Input id="author" name="author" placeholder="Muallif ismi" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Tavsif (ixtiyoriy)</Label>
            <Textarea id="description" name="description" placeholder="Kitob haqida..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject_id">Fan (ixtiyoriy)</Label>
            <select
              id="subject_id"
              name="subject_id"
              className="w-full rounded-lg border px-3 py-2.5 text-sm bg-background focus-visible:outline-2"
            >
              <option value="">— Fan tanlang —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="text-sm font-medium mb-2">Sinflar *</legend>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => {
                const sel = selectedClasses.includes(cls.id);
                return (
                  <button
                    key={cls.id}
                    type="button"
                    role="checkbox"
                    aria-checked={sel}
                    onClick={() => toggleClass(cls.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 ${
                      sel ? "border-primary bg-primary/10 font-medium" : "border-border hover:bg-muted"
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

      {/* PDF */}
      <Card>
        <CardHeader>
          <CardTitle>PDF fayl *</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadField
            label="PDF fayl yuklang"
            accept=".pdf"
            maxSizeMb={50}
            onUploaded={(url) => setPdfUrl(url)}
            folder="books"
          />
          {pdfUrl && (
            <p className="text-xs text-green-600 mt-2">✓ PDF yuklandi</p>
          )}
        </CardContent>
      </Card>

      {/* Audio */}
      <Card>
        <CardHeader>
          <CardTitle>Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Rejim tanlash */}
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Audio rejimi">
            <button
              type="button"
              role="radio"
              aria-checked={audioMode === "none"}
              onClick={() => setAudioMode("none")}
              className={`rounded-lg border-2 p-3 text-center text-sm transition-colors focus-visible:outline-2 ${
                audioMode === "none"
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className="text-xl mb-1" aria-hidden="true">🔇</div>
              <div className="font-medium text-xs">Audiosiz</div>
              <div className="text-xs text-muted-foreground mt-0.5">Brauzer ovozi</div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={audioMode === "upload"}
              onClick={() => setAudioMode("upload")}
              className={`rounded-lg border-2 p-3 text-center text-sm transition-colors focus-visible:outline-2 ${
                audioMode === "upload"
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className="text-xl mb-1" aria-hidden="true">📁</div>
              <div className="font-medium text-xs">O&apos;zim yuklayman</div>
              <div className="text-xs text-muted-foreground mt-0.5">MP3, WAV, OGG</div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={audioMode === "ai"}
              onClick={() => setAudioMode("ai")}
              className={`rounded-lg border-2 p-3 text-center text-sm transition-colors focus-visible:outline-2 ${
                audioMode === "ai"
                  ? "border-primary bg-primary/5 font-medium"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <div className="text-xl mb-1" aria-hidden="true">🤖</div>
              <div className="font-medium text-xs">AI yaratsin</div>
              <div className="text-xs text-muted-foreground mt-0.5">Avtomatik</div>
            </button>
          </div>

          {/* Audiosiz */}
          {audioMode === "none" && (
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              O&apos;quvchilar kitobni o&apos;qiyotganda brauzerning o&apos;rnatilgan ovoz xususiyatidan foydalanadi.
            </div>
          )}

          {/* O'zim yuklayman */}
          {audioMode === "upload" && (
            <div className="space-y-2">
              <FileUploadField
                label="Audio fayl yuklang (MP3, WAV, OGG)"
                accept=".mp3,.wav,.ogg"
                maxSizeMb={200}
                onUploaded={(url) => setAudioUrl(url)}
                folder="books-audio"
              />
              {audioUrl && (
                <p className="text-xs text-green-600">✓ Audio yuklandi</p>
              )}
            </div>
          )}

          {/* AI yaratsin */}
          {audioMode === "ai" && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-sm">
                <span>🤖</span> AI audio yaratish
              </div>
              <p className="text-xs text-muted-foreground">
                Kitob saqlanganidan so&apos;ng kitoblar ro&apos;yxatida <strong>&quot;AI Audio yaratish&quot;</strong> tugmasi paydo bo&apos;ladi.
                Tugmani bosish bilan AI kitob matnini o&apos;qib, audio fayl yaratadi.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/teacher/books")} disabled={isPending}>
          {uz.common.cancel}
        </Button>
        <Button type="submit" disabled={isPending || !pdfUrl} aria-busy={isPending}>
          {isPending
            ? (audioMode === "ai" ? "🤖 Audio yaratilmoqda..." : uz.common.loading)
            : "Kitob qo'shish"}
        </Button>
      </div>
    </form>
  );
}
