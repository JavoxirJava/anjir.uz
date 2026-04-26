import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBookById } from "@/lib/db/books";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { EditBookForm } from "./EditBookForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kitobni tahrirlash — I-Imkon.uz",
};

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [book, { subjects, classes }] = await Promise.all([
    getBookById(id),
    getTeacherSubjectsAndClasses(user!.id),
  ]);

  if (!book) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Kitobni tahrirlash</h1>
      <EditBookForm
        book={book}
        subjects={subjects}
        classes={classes}
      />
    </div>
  );
}
