import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/api/auth";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { apiGet } from "@/lib/api/server";
import { TopicManager } from "./TopicManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mavzular — I-Imkon.uz",
};

export default async function TeacherTopicsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { classes } = await getTeacherSubjectsAndClasses(user.id);
  const subjects = await apiGet<Array<{ id: string; name: string }>>("/subjects").catch(() => []);
  const teacherTopics = await apiGet<Array<{ id: string; name: string }>>(`/teachers/${user.id}/subjects`).catch(() => []);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Mavzular</h1>
      <TopicManager subjects={subjects} classes={classes} teacherTopics={teacherTopics} />
    </div>
  );
}
