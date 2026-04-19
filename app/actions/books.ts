"use server";

import { createClient } from "@/lib/supabase/server";
import { createBook, deleteBook, updateBookAudio, addBookmark, removeBookmark } from "@/lib/db/books";
import { uploadToR2 } from "@/lib/storage/r2";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bookSchema = z.object({
  title: z.string().min(2, "Sarlavha kamida 2 ta belgi"),
  author: z.string().optional(),
  description: z.string().optional(),
  pdf_url: z.string().optional(),
  audio_url: z.string().optional(),
  audio_source: z.enum(["uploaded", "web_speech", "google_tts"]).optional(),
  subject_id: z.string().optional(),
  classIds: z.array(z.string()).min(1, "Kamida 1 ta sinf tanlang"),
});

export async function createBookAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const raw = {
    title: formData.get("title"),
    author: formData.get("author") || undefined,
    description: formData.get("description") || undefined,
    pdf_url: formData.get("pdf_url") || undefined,
    audio_url: formData.get("audio_url") || undefined,
    audio_source: formData.get("audio_source") || undefined,
    subject_id: formData.get("subject_id") || undefined,
    classIds: formData.getAll("classIds"),
  };

  const parsed = bookSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (!parsed.data.pdf_url) return { error: "PDF fayl yuklang" };

  try {
    const id = await createBook({
      title: parsed.data.title,
      author: parsed.data.author ?? null,
      description: parsed.data.description ?? null,
      pdf_url: parsed.data.pdf_url,
      audio_url: parsed.data.audio_url ?? null,
      audio_source: parsed.data.audio_source ?? null,
      subject_id: parsed.data.subject_id ?? null,
      teacher_id: user.id,
      classIds: parsed.data.classIds,
    });
    revalidatePath("/teacher/books");
    return { id };
  } catch (err) {
    console.error(err);
    return { error: "Kitob yaratishda xatolik" };
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
