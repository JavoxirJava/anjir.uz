import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBooksForStudent } from "@/lib/db/books";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `${uz.books.title} — I-Imkon.uz`,
};

export default async function StudentBooksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("class_id")
    .eq("user_id", user.id)
    .single();

  const books = profile?.class_id ? await getBooksForStudent(profile.class_id) : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.books.title}</h1>

      {books.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label={uz.books.title}>
          {books.map((book) => (
            <li key={book.id}>
              <Link
                href={`/app/books/${book.id}`}
                className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl"
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardContent className="pt-5 pb-5 space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {book.pdf_url && <Badge variant="secondary">📄 PDF</Badge>}
                      {book.audio_url && <Badge variant="outline">🔊 Audio</Badge>}
                    </div>
                    <h2 className="font-semibold">{book.title}</h2>
                    {book.author && (
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    )}
                    {book.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{book.description}</p>
                    )}
                    {book.subjects && (
                      <p className="text-xs text-muted-foreground">
                        📚 {Array.isArray(book.subjects)
                          ? (book.subjects[0] as { name: string })?.name
                          : (book.subjects as { name: string }).name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
