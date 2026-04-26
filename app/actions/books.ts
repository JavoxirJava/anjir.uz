"use server";

import { getCurrentUser } from "@/lib/api/auth";
import { createBook, deleteBook, updateBook, updateBookAudio, addBookmark } from "@/lib/api/books";
import { apiDelete } from "@/lib/api/server";
import { uploadToR2 } from "@/lib/storage/r2";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import OpenAI from "openai";

const bookSchema = z.object({
  title:        z.string().min(2, "Sarlavha kamida 2 ta belgi"),
  description:  z.string().optional(),
  pdf_url:      z.string().min(1, "PDF fayl yuklang"),
  audio_url:    z.string().optional(),
  audio_source: z.enum(["uploaded", "web_speech", "google_tts"]).optional(),
  classIds:     z.array(z.string()).min(1, "Kamida 1 ta sinf tanlang"),
});

async function generateAudioWithAI(bookId: string, title: string, description?: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let input = `${title}.`;
  if (description?.trim()) input += ` ${description.trim()}`;
  const mp3 = await openai.audio.speech.create({ model: "tts-1", voice: "alloy", input: input.slice(0, 500) });
  const key = `books-audio/${bookId}-ai.mp3`;
  return uploadToR2(key, Buffer.from(await mp3.arrayBuffer()), "audio/mpeg");
}

export async function createBookAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const raw = {
    title:        formData.get("title"),
    description:  formData.get("description")  || undefined,
    pdf_url:      formData.get("pdf_url")      || "",
    audio_url:    formData.get("audio_url")    || undefined,
    audio_source: formData.get("audio_source") || undefined,
    classIds:     formData.getAll("classIds"),
  };

  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const isAiAudio = parsed.data.audio_source === "google_tts";

  try {
    const id = await createBook({
      title:        parsed.data.title,
      description:  parsed.data.description ?? null,
      pdf_url:      parsed.data.pdf_url,
      audio_url:    isAiAudio ? null : (parsed.data.audio_url ?? null),
      audio_source: isAiAudio ? null : (parsed.data.audio_source ?? null),
      teacher_id:   user.id,
      classIds:     parsed.data.classIds,
    });

    if (isAiAudio) {
      try {
        const audioUrl = await generateAudioWithAI(id, parsed.data.title, parsed.data.description);
        await updateBookAudio(id, audioUrl, "google_tts");
      } catch (e) {
        await deleteBook(id);
        return { error: `AI audio xatosi: ${e instanceof Error ? e.message : "noma'lum"}` };
      }
    }

    revalidatePath("/teacher/books");
    return { id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Kitob yaratishda xatolik" };
  }
}

export async function updateBookAction(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const raw = {
    title:        formData.get("title"),
    description:  formData.get("description") || undefined,
    pdf_url:      formData.get("pdf_url")     || "",
    audio_url:    formData.get("audio_url")   || undefined,
    audio_source: formData.get("audio_source") || undefined,
    classIds:     formData.getAll("classIds"),
  };

  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await updateBook(id, {
      title:        parsed.data.title,
      description:  parsed.data.description ?? null,
      pdf_url:      parsed.data.pdf_url,
      audio_url:    parsed.data.audio_url   ?? null,
      audio_source: parsed.data.audio_source ?? null,
      classIds:     parsed.data.classIds,
    });
    revalidatePath("/teacher/books");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Kitobni yangilashda xatolik" };
  }
}

export async function deleteBookAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  try {
    await deleteBook(id);
    revalidatePath("/teacher/books");
    return { success: true };
  } catch {
    return { error: "Kitobni o'chirishda xatolik" };
  }
}

export async function addBookmarkAction(bookId: string, page: number, _note?: string | null) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  try {
    await addBookmark(user.id, bookId, page);
    revalidatePath(`/app/books/${bookId}`);
    return { success: true };
  } catch {
    return { error: "Xatchet saqlashda xatolik" };
  }
}

export async function removeBookmarkAction(bookId: string, page: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  try {
    await apiDelete(`/books/${bookId}/bookmark?page=${page}`);
    revalidatePath(`/app/books/${bookId}`);
    return { success: true };
  } catch {
    return { error: "Xatchet o'chirishda xatolik" };
  }
}
