"use server";

import { createClient } from "@/lib/supabase/server";
import { createBook, deleteBook, updateBook, updateBookAudio, addBookmark, removeBookmark } from "@/lib/db/books";
import { uploadToR2 } from "@/lib/storage/r2";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import OpenAI from "openai";

const bookSchema = z.object({
  title: z.string().min(2, "Sarlavha kamida 2 ta belgi"),
  author: z.string().optional(),
  description: z.string().optional(),
  pdf_url: z.string().min(1, "PDF fayl yuklang"),
  audio_url: z.string().optional(),
  audio_source: z.enum(["uploaded", "web_speech", "google_tts"]).optional(),
  subject_id: z.string().optional(),
  classIds: z.array(z.string()).min(1, "Kamida 1 ta sinf tanlang"),
});

/** OpenAI TTS orqali matndan audio yaratish va R2 ga yuklash */
async function generateAudioWithAI(
  bookId: string,
  title: string,
  description: string | null | undefined
): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Faqat sarlavha + tavsif — qisqa va aniq (max ~500 belgi)
  let input = `${title}.`;
  if (description?.trim()) {
    input += ` ${description.trim()}`;
  }
  // 500 belgidan oshsa qirqamiz
  input = input.slice(0, 500);

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input,
  });

  const audioBuffer = Buffer.from(await mp3.arrayBuffer());
  const key = `books-audio/${bookId}-ai.mp3`;
  return uploadToR2(key, audioBuffer, "audio/mpeg");
}

export async function createBookAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const raw = {
    title:        formData.get("title"),
    author:       formData.get("author")       || undefined,
    description:  formData.get("description")  || undefined,
    pdf_url:      formData.get("pdf_url")      || "",
    audio_url:    formData.get("audio_url")    || undefined,
    audio_source: formData.get("audio_source") || undefined,
    subject_id:   formData.get("subject_id")   || undefined,
    classIds:     formData.getAll("classIds"),
  };

  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const isAiAudio = parsed.data.audio_source === "google_tts";

  try {
    // 1. Kitobni saqlash (audio yo'q holda)
    const id = await createBook({
      title:        parsed.data.title,
      author:       parsed.data.author      ?? null,
      description:  parsed.data.description ?? null,
      pdf_url:      parsed.data.pdf_url,
      audio_url:    isAiAudio ? null : (parsed.data.audio_url ?? null),
      audio_source: isAiAudio ? null : (parsed.data.audio_source ?? null),
      subject_id:   parsed.data.subject_id  ?? null,
      teacher_id:   user.id,
      classIds:     parsed.data.classIds,
    });

    // 2. AI audio rejimi: PDF matnini olib, audio yaratish
    if (isAiAudio) {
      try {
        const audioUrl = await generateAudioWithAI(
          id,
          parsed.data.title,
          parsed.data.description
        );
        await updateBookAudio(id, audioUrl, "google_tts");
      } catch (audioErr) {
        console.error("AI audio xatosi:", audioErr);
        // Audio yaratilmadi — kitobni o'chiramiz (rollback)
        try { await deleteBook(id); } catch { /* ignore */ }
        const msg = audioErr instanceof Error ? audioErr.message : "AI audio yaratishda xatolik";
        return { error: `AI audio yaratishda xatolik: ${msg}` };
      }
    }

    revalidatePath("/teacher/books");
    return { id };
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : "Kitob yaratishda xatolik";
    return { error: msg };
  }
}

export async function updateBookAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const raw = {
    title:        formData.get("title"),
    author:       formData.get("author")       || undefined,
    description:  formData.get("description")  || undefined,
    pdf_url:      formData.get("pdf_url")      || "",
    audio_url:    formData.get("audio_url")    || undefined,
    audio_source: formData.get("audio_source") || undefined,
    subject_id:   formData.get("subject_id")   || undefined,
    classIds:     formData.getAll("classIds"),
  };

  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await updateBook(id, {
      title:        parsed.data.title,
      author:       parsed.data.author      ?? null,
      description:  parsed.data.description ?? null,
      pdf_url:      parsed.data.pdf_url,
      audio_url:    parsed.data.audio_url   ?? null,
      audio_source: parsed.data.audio_source ?? null,
      subject_id:   parsed.data.subject_id  ?? null,
      classIds:     parsed.data.classIds,
    });
    revalidatePath("/teacher/books");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Kitobni yangilashda xatolik";
    return { error: msg };
  }
}

export async function deleteBookAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  try {
    await deleteBook(id);
    revalidatePath("/teacher/books");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Kitobni o'chirishda xatolik" };
  }
}

export async function addBookmarkAction(bookId: string, page: number, note: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  try {
    await addBookmark(user.id, bookId, page, note);
    revalidatePath(`/app/books/${bookId}`);
    return { success: true };
  } catch {
    return { error: "Xatchet saqlashda xatolik" };
  }
}

export async function removeBookmarkAction(bookId: string, page: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  try {
    await removeBookmark(user.id, bookId, page);
    revalidatePath(`/app/books/${bookId}`);
    return { success: true };
  } catch {
    return { error: "Xatchetni o'chirishda xatolik" };
  }
}
