import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { uz } from "@/lib/strings/uz";
import { NewBookForm } from "./NewBookForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.books.add} — I-Imkon.uz`,
};

export default async function NewBookPage() {
  const user = await getCurrentUser();

  const { subjects, classes } = await getTeacherSubjectsAndClasses(user!.id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.books.add}</h1>
      <NewBookForm subjects={subjects} classes={classes} />
    </div>
  );
}
