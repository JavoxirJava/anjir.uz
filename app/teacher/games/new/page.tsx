import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { uz } from "@/lib/strings/uz";
import { GameBuilderForm } from "./GameBuilderForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.teacher.addGame} — I-Imkon.uz`,
};

interface Props {
  searchParams: Promise<{ subjectId?: string | string[] }>;
}

export default async function NewGamePage({ searchParams }: Props) {
  const user = await getCurrentUser();

  const { subjects, classes } = await getTeacherSubjectsAndClasses(user!.id);
  const q = await searchParams;
  const requestedSubjectId = typeof q.subjectId === "string" ? q.subjectId : undefined;
  const uniqueSubjects = Array.from(
    new Map(
      subjects
        .filter((s) => !s.fan_subject_id)
        .map((s) => [s.id, { id: s.id, name: s.name }])
    ).values()
  );
  const selectedSubject = uniqueSubjects.find((s) => s.id === requestedSubjectId);

  if (!selectedSubject) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Mavzu tanlang</h1>
          <p className="text-sm text-muted-foreground">
            {uz.teacher.addGame} uchun avval mavzuni tanlang.
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list" aria-label="Mavzular ro'yxati">
          {uniqueSubjects.map((subject) => (
            <li key={subject.id}>
              <Link
                href={`/teacher/games/new?subjectId=${subject.id}`}
                className="block rounded-lg border px-4 py-3 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="font-medium">{subject.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.addGame}</h1>
      <GameBuilderForm
        subjects={uniqueSubjects}
        classes={classes}
        initialSubjectId={selectedSubject.id}
      />
    </div>
  );
}
