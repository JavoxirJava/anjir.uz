"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateBookAction } from "@/app/actions/books";
import { FileUploadField } from "@/components/lectures/FileUploadField";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookRow } from "@/lib/db/books";

interface Subject { id: string; name: string }
interface ClassItem { id: string; grade: number; letter: string }

type AudioMode = "none" | "upload" | "ai";

function resolveAudioMode(book: BookRow): AudioMode {
  if (!book.audio_url && book.audio_source !== "google_tts") return "none";
  if (book.audio_source === "google_tts") return "ai";
  return "upload";
}

export function EditBookForm({
  book,
  subjects,
  classes,
}: {
  book: BookRow & { book_classes?: { class_id: string }[] };
  subjects: Subject[];
  classes: ClassItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    book.book_classes?.map((bc) => bc.class_id) ?? []
  );
  const [pdfUrl, setPdfUrl] = useState(book.pdf_url ?? "");
  const [audioUrl, setAudioUrl] = useState(book.audio_url ?? "");
  const [audioMode, setAudioMode] = useState<AudioMode>(resolveAudioMode(book));

  function toggleClass(id: string) {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pdfUrl) { toast.error("PDF fayl yuklang"); return; }
    if (selectedClasses.length === 0) { toast.error("Kamida 1 ta sinf tanlang"); return; }

    const fd = new FormData(e.currentTarget);
    fd.set("pdf_url", pdfUrl);

    if (audioMode === "upload" && audioUrl) {
      fd.set("audio_url", audioUrl);
      fd.set("audio_source", "uploaded");
    } else if (audioMode === "ai") {
      fd.set("audio_source", "google_tts");
    } else {
      fd.delete("audio_url");
      fd.delete("audio_source");
    }

    selectedClasses.forEach((c) => fd.append("classIds", c));

    startTransition(async () => {
      const result = await updateBookAction(book.id, fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Kitob yangilandi!");
        router.push("/teacher/books");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Kitob ma&apos;lumotlari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Sarlavha *</Label>
            <Input id="title" name="title" defaultValue={book.title} placeholder="Kitob nomi" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="author">Muallif (ixtiyoriy)</Label>
            <Input id="author" name="author" defaultValue={book.author ?? ""} placeholder="Muallif ismi" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Tavsif (ixtiyoriy)</Label>
            <Textarea id="description" name="description" defaultValue={book.description ?? ""} placeholder="Kitob haqida..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject_id">Fan (ixtiyoriy)</Label>
            <select
              id="subject_id"
              name="subject_id"
              defaultValue={book.subject_id ?? ""}
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
        <CardContent className="space-y-2">
          {pdfUrl && (
            <p className="text-xs text-green-600">✓ Hozirgi PDF mavjud</p>
          )}
          <FileUploadField
            label="Yangi PDF yuklash (ixtiyoriy)"
            accept=".pdf"
            maxSizeMb={50}
            onUploaded={(url) => setPdfUrl(url)}
            folder="books"
          />
        </CardContent>
      </Card>

      {/* Audio */}
      <Card>
        <CardHeader>
          <CardTitle>Audio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Audio rejimi">
            {(["none", "upload", "ai"] as AudioMode[]).map((mode) => {
              const labels: Record<AudioMode, { icon: string; title: string; sub: string }> = {
                none:   { icon: "🔇", title: "Audiosiz",       sub: "Brauzer ovozi" },
                upload: { icon: "📁", title: "O'zim yuklayman", sub: "MP3, WAV, OGG" },
                ai:     { icon: "🤖", title: "AI yaratsin",    sub: "Avtomatik" },
              };
              const l = labels[mode];
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={audioMode === mode}
                  onClick={() => setAudioMode(mode)}
                  className={`rounded-lg border-2 p-3 text-center text-sm transition-colors focus-visible:outline-2 ${
                    audioMode === mode
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="text-xl mb-1" aria-hidden="true">{l.icon}</div>
                  <div className="font-medium text-xs">{l.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{l.sub}</div>
                </button>
              );
            })}
          </div>

          {audioMode === "none" && (
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              O&apos;quvchilar brauzerning o&apos;rnatilgan ovoz xususiyatidan foydalanadi.
            </div>
          )}

          {audioMode === "upload" && (
            <div className="space-y-2">
              {audioUrl && <p className="text-xs text-green-600">✓ Hozirgi audio mavjud</p>}
              <FileUploadField
                label="Yangi audio yuklash"
                accept=".mp3,.wav,.ogg"
                maxSizeMb={200}
                onUploaded={(url) => setAudioUrl(url)}
                folder="books-audio"
              />
            </div>
          )}

          {audioMode === "ai" && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              AI audio kitob sarlavhasi va tavsifidan yaratiladi.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/teacher/books")} disabled={isPending}>
          {uz.common.cancel}
        </Button>
        <Button type="submit" disabled={isPending || !pdfUrl} aria-busy={isPending}>
          {isPending ? uz.common.loading : "Saqlash"}
        </Button>
      </div>
    </form>
  );
}
