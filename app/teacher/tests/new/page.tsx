import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { uz } from "@/lib/strings/uz";
import { getGamesByTeacher } from "@/lib/api/games";
import { TestBuilderForm } from "./TestBuilderForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.teacher.addTest} — I-Imkon.uz`,
};

export default async function NewTestPage() {
  const user = await getCurrentUser();

  const [{ subjects, topics, classes }, games] = await Promise.all([
    getTeacherSubjectsAndClasses(user!.id),
    getGamesByTeacher(user!.id).catch(() => []),
  ]);

  const topicIds = new Set(topics.map((t) => t.id));
  const fans = Array.from(
    new Map(
      subjects
        .filter((s) => !topicIds.has(s.id))
        .map((s) => [s.id, { id: s.id, name: s.name }])
    ).values()
  );

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.addTest}</h1>
      <TestBuilderForm subjects={fans} classes={classes} games={games} />
    </div>
  );
}
