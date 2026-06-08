import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { uz } from "@/lib/strings/uz";
import { GameBuilderForm } from "./GameBuilderForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.teacher.addGame} — I-Imkon.uz`,
};

export default async function NewGamePage() {
  const user = await getCurrentUser();
  const { subjects, classes } = await getTeacherSubjectsAndClasses(user!.id);
  const uniqueSubjects = Array.from(
    new Map(subjects.map((s) => [s.id, { id: s.id, name: s.name }])).values()
  );

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.addGame}</h1>
      <GameBuilderForm subjects={uniqueSubjects} classes={classes} />
    </div>
  );
}
