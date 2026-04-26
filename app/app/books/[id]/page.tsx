import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { getBookById, getUserBookmarks } from "@/lib/db/books";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { BookReader } from "./BookReader";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = await getBookById(id);
  return { title: book ? `${book.title} — I-Imkon.uz` : "Kitob" };
}

export default async function StudentBookPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const book = await getBookById(id);
  if (!book || !book.pdf_url) notFound();

  const bookmarks = await getUserBookmarks(user.id, id);

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <header className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {book.pdf_url && <Badge variant="secondary">📄 PDF</Badge>}
          {book.audio_url && <Badge variant="outline">🔊 Audio mavjud</Badge>}
          {book.subjects && (
            <Badge variant="outline">
              📚 {Array.isArray(book.subjects)
                ? (book.subjects[0] as { name: string })?.name
                : (book.subjects as { name: string }).name}
            </Badge>
          )}
        </div>
        <h1 className="text-xl font-bold">{book.title}</h1>
        {book.author && (
          <p className="text-sm text-muted-foreground">{book.author}</p>
        )}
      </header>

      <BookReader
        bookId={id}
        pdfUrl={book.pdf_url}
        audioUrl={book.audio_url}
        title={book.title}
        bookmarks={bookmarks.map((b) => b.page)}
      />
    </div>
  );
}
