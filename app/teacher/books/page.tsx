import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBooksByTeacher } from "@/lib/db/books";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { BookDeleteButton } from "./BookDeleteButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.books.title} — I-Imkon.uz`,
};

export default async function TeacherBooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const books = await getBooksByTeacher(user!.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">{uz.books.title}</h1>
        <Link
          href="/teacher/books/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          + {uz.books.add}
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
          <Link href="/teacher/books/new" className="mt-4 inline-block text-sm text-primary underline">
            {uz.books.add}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label={uz.books.title}>
          {books.map((book) => (
            <li key={book.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 pt-4 pb-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      {book.pdf_url && <span>📄 PDF</span>}
                      {book.audio_url && <span>🔊 Audio</span>}
                    </div>
                    <h2 className="font-medium">{book.title}</h2>
                    {book.author && (
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/teacher/books/${book.id}/edit`}
                      className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      Tahrirlash
                    </Link>
                    <BookDeleteButton id={book.id} />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
