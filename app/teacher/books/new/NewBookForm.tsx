"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBookAction } from "@/app/actions/books";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FileUploadField } from "@/components/lectures/FileUploadField";
import { uz } from "@/lib/strings/uz";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Subject { id: string; name: string }
interface ClassItem { id: string; grade: number; letter: string }

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

  const pdfUpload = useFileUpload({
    accept: ".pdf",
    maxMb: 50,
    onSuccess: (url) => setPdfUrl(url),
  });

  const audioUpload = useFileUpload({
    accept: ".mp3,.wav,.ogg",
    maxMb: 200,
    onSuccess: (url) => setAudioUrl(url),
  });

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
    fd.append("pdf_url", pdfUrl);
    if (audioUrl) {
      fd.append("audio_url", audioUrl);
      fd.append("audio_source", "uploaded");
    }
    selectedClasses.forEach((c) => fd.append("classIds", c));

    startTransition(async () => {
      const result = await createBookAction(fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Kitob qo'shildi!");
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

      <Card>
        <CardHeader>
          <CardTitle>PDF fayl *</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadField
            label="PDF fayl yuklang"
            accept=".pdf"
            maxMb={50}
            uploadState={pdfUpload}
            id="book-pdf"
          />
          {pdfUrl && (
            <p className="text-xs text-green-600 mt-2">✓ PDF yuklandi</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audio fayl (ixtiyoriy)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Audio bo&apos;lmasa, o&apos;quvchilar brauzerning ovozli o&apos;qish xususiyatidan foydalanadi.
          </p>
          <FileUploadField
            label="Audio fayl yuklang (MP3, WAV, OGG)"
            accept=".mp3,.wav,.ogg"
            maxMb={200}
            uploadState={audioUpload}
            id="book-audio"
          />
          {audioUrl && (
            <p className="text-xs text-green-600 mt-2">✓ Audio yuklandi</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/teacher/books")} disabled={isPending}>
          {uz.common.cancel}
        </Button>
        <Button type="submit" disabled={isPending || !pdfUrl} aria-busy={isPending}>
          {isPending ? uz.common.loading : "Kitob qo'shish"}
        </Button>
      </div>
    </form>
  );
}
