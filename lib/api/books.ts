import { apiGet, apiPost, apiPut, apiDelete } from "./server";

export type BookRow = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  pdf_url: string | null;
  audio_url: string | null;
  audio_source: string | null;
  subject_id: string | null;
  teacher_id: string;
  created_at: string;
  subjects?: { id: string; name: string } | null;
};

export type BookmarkRow = {
  id: string;
  user_id: string;
  book_id: string;
  page: number;
  created_at: string;
};

export async function getBooksByTeacher(teacherId: string): Promise<BookRow[]> {
  return apiGet(`/books?teacher_id=${teacherId}`);
}

export async function getBookById(id: string): Promise<(BookRow & { class_ids?: string[] }) | null> {
  try { return await apiGet(`/books/${id}`); } catch { return null; }
}

export async function getBooksForStudent(classId: string): Promise<BookRow[]> {
  return apiGet(`/books?class_id=${classId}`);
}

export async function createBook(input: {
  title: string;
  description: string | null;
  pdf_url: string | null;
  audio_url: string | null;
  audio_source: string | null;
  teacher_id: string;
  classIds: string[];
}): Promise<string> {
  void input.teacher_id;
  const r = await apiPost<{ id: string }>("/books", {
    title:        input.title,
    description:  input.description,
    pdf_url:      input.pdf_url,
    audio_url:    input.audio_url,
    audio_source: input.audio_source,
    class_ids:    input.classIds,
  });
  return r.id;
}

export async function updateBook(id: string, input: {
  title: string;
  description: string | null;
  pdf_url: string | null;
  audio_url: string | null;
  audio_source: string | null;
  classIds: string[];
}): Promise<void> {
  await apiPut(`/books/${id}`, {
    title:        input.title,
    description:  input.description,
    pdf_url:      input.pdf_url,
    audio_url:    input.audio_url,
    audio_source: input.audio_source,
    class_ids:    input.classIds,
  });
}

export async function deleteBook(id: string): Promise<void> {
  await apiDelete(`/books/${id}`);
}

export async function updateBookAudio(bookId: string, audioUrl: string, source: string): Promise<void> {
  await apiPut(`/books/${bookId}`, { audio_url: audioUrl, audio_source: source });
}

export async function getUserBookmarks(userId: string, bookId: string): Promise<BookmarkRow[]> {
  void userId;
  return apiGet(`/books/${bookId}/bookmarks`);
}

export async function addBookmark(userId: string, bookId: string, page: number): Promise<void> {
  void userId;
  await apiPut(`/books/${bookId}/bookmark`, { page });
}
