import { createClient } from "@/lib/supabase/server";

export interface BookRow {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  pdf_url: string | null;
  audio_url: string | null;
  audio_source: "uploaded" | "web_speech" | "google_tts" | null;
  subject_id: string | null;
  teacher_id: string;
  created_at: string;
  subjects?: { name: string } | null;
}

export interface BookmarkRow {
  id: string;
  book_id: string;
  user_id: string;
  page: number;
  note: string | null;
  created_at: string;
}

/** O'qituvchi kitoblari */
export async function getBooksByTeacher(teacherId: string): Promise<BookRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*, subjects(name)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as BookRow[];
}

/** Bitta kitob */
export async function getBookById(id: string): Promise<BookRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("books")
    .select("*, subjects(name)")
    .eq("id", id)
    .single();
  return data as unknown as BookRow | null;
}

/** O'quvchi uchun kitoblar (class bo'yicha yoki umumiy) */
export async function getBooksForStudent(classId: string): Promise<BookRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*, subjects(name), book_classes!inner(class_id)")
    .eq("book_classes.class_id", classId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as BookRow[];
}

/** Kitob yaratish */
export async function createBook(input: {
  title: string;
  author: string | null;
  description: string | null;
  pdf_url: string | null;
  audio_url: string | null;
  audio_source: string | null;
  subject_id: string | null;
  teacher_id: string;
  classIds: string[];
}): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("books")
    .insert({
      title: input.title,
      author: input.author,
      description: input.description,
      pdf_url: input.pdf_url,
      audio_url: input.audio_url,
      audio_source: input.audio_source,
      subject_id: input.subject_id,
      teacher_id: input.teacher_id,
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Kitob yaratilmadi");

  if (input.classIds.length > 0) {
    await supabase
      .from("book_classes")
      .insert(input.classIds.map((class_id) => ({ book_id: data.id, class_id })));
  }

  return data.id;
}

/** Kitob o'chirish */
export async function deleteBook(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("books").delete().eq("id", id);
}

/** Audio URL ni yangilash (AI generatsiyadan keyin) */
export async function updateBookAudio(
  bookId: string,
  audioUrl: string,
  source: string
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("books")
    .update({ audio_url: audioUrl, audio_source: source })
    .eq("id", bookId);
}

/** Xatchetlar */
export async function getUserBookmarks(userId: string, bookId: string): Promise<BookmarkRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("book_bookmarks")
    .select("*")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .order("page");
  return (data ?? []) as BookmarkRow[];
}

export async function addBookmark(
  userId: string,
  bookId: string,
  page: number,
  note: string | null
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("book_bookmarks")
    .upsert({ user_id: userId, book_id: bookId, page, note }, { onConflict: "user_id,book_id,page" });
}

export async function removeBookmark(userId: string, bookId: string, page: number): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("book_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .eq("page", page);
}
