import { createAdminClient } from "@/lib/supabase/admin";

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
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("books")
    .select("*")
    .eq("uploader_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as BookRow[];
}

/** Bitta kitob (book_classes bilan) */
export async function getBookById(id: string): Promise<(BookRow & { book_classes?: { class_id: string }[] }) | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("books")
    .select("*, book_classes(class_id)")
    .eq("id", id)
    .single();
  return data as unknown as (BookRow & { book_classes?: { class_id: string }[] }) | null;
}

/** Kitob yangilash */
export async function updateBook(
  id: string,
  input: {
    title: string;
    author: string | null;
    description: string | null;
    pdf_url: string | null;
    audio_url: string | null;
    audio_source: string | null;
    subject_id: string | null;
    classIds: string[];
  }
): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("books")
    .update({
      title:        input.title,
      author:       input.author,
      description:  input.description,
      pdf_url:      input.pdf_url,
      audio_url:    input.audio_url,
      audio_source: input.audio_source,
      subject_id:   input.subject_id,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Sinflarni yangilash
  await admin.from("book_classes").delete().eq("book_id", id);
  if (input.classIds.length > 0) {
    await admin
      .from("book_classes")
      .insert(input.classIds.map((class_id) => ({ book_id: id, class_id })));
  }
}

/** O'quvchi uchun kitoblar */
export async function getBooksForStudent(classId: string): Promise<BookRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("books")
    .select("*, book_classes!inner(class_id)")
    .eq("book_classes.class_id", classId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
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
  const admin = createAdminClient();

  // Faqat initial schemada mavjud ustunlar bilan insert
  const { data, error } = await admin
    .from("books")
    .insert({
      uploader_id:  input.teacher_id,
      title:        input.title,
      description:  input.description,
      pdf_url:      input.pdf_url,
      audio_url:    input.audio_url,
      audio_source: input.audio_source,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Kitob yaratilmadi");

  // Migration 003 ustunlari (author, subject_id) — mavjud bo'lsa yangilash
  if (input.author || input.subject_id) {
    await admin
      .from("books")
      .update({
        ...(input.author     ? { author:     input.author }     : {}),
        ...(input.subject_id ? { subject_id: input.subject_id } : {}),
      })
      .eq("id", data.id)
      .then(() => {}); // xato bo'lsa jim o'tkazamiz (ustun yo'q bo'lishi mumkin)
  }

  // book_classes jadvali (migration 003) — mavjud bo'lsa qo'shamiz
  if (input.classIds.length > 0) {
    await admin
      .from("book_classes")
      .insert(input.classIds.map((class_id) => ({ book_id: data.id, class_id })))
      .then(() => {}); // jadval yo'q bo'lsa jim o'tkazamiz
  }

  return data.id;
}

/** Kitob o'chirish */
export async function deleteBook(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("books").delete().eq("id", id);
  if (error) throw error;
}

/** Audio URL ni yangilash */
export async function updateBookAudio(
  bookId: string,
  audioUrl: string,
  source: string
): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("books")
    .update({ audio_url: audioUrl, audio_source: source })
    .eq("id", bookId);
}

/** Xatchetlar */
export async function getUserBookmarks(userId: string, bookId: string): Promise<BookmarkRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
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
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("book_bookmarks")
    .select("user_id")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .eq("page", page)
    .single();

  if (existing) {
    await admin
      .from("book_bookmarks")
      .update({ note })
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .eq("page", page);
  } else {
    await admin
      .from("book_bookmarks")
      .insert({ user_id: userId, book_id: bookId, page, note });
  }
}

export async function removeBookmark(userId: string, bookId: string, page: number): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("book_bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .eq("page", page);
}
