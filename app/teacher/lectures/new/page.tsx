import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { apiGet } from "@/lib/api/server";
import { uz } from "@/lib/strings/uz";
import { NewLectureForm } from "./NewLectureForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.teacher.addLecture} — I-Imkon.uz`,
};

interface Props {
  searchParams: Promise<{ subjectId?: string | string[] }>;
}

export default async function NewLecturePage({ searchParams }: Props) {
  const user = await getCurrentUser();

  const options = await getTeacherSubjectsAndClasses(user!.id);
  const topics = Array.isArray(options.subjects) ? options.subjects : [];
  const classes = Array.isArray(options.classes) ? options.classes : [];
  const allSubjects = await apiGet<Array<{ id: string; name: string }>>("/subjects").catch(() => []);
  const fanIds = Array.from(
    new Set(topics.map((topic) => topic.fan_subject_id).filter((id): id is string => Boolean(id)))
  );
  const fans = fanIds.length > 0
    ? allSubjects.filter((subject) => fanIds.includes(subject.id))
    : allSubjects;
  const q = await searchParams;
  const requestedSubjectId = typeof q.subjectId === "string" ? q.subjectId : undefined;
  const initialSubjectId =
    requestedSubjectId && topics.some((subject) => subject.id === requestedSubjectId)
      ? requestedSubjectId
      : undefined;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.addLecture}</h1>
      <NewLectureForm fans={fans} topics={topics} classes={classes} initialSubjectId={initialSubjectId} />
    </div>
  );
}
