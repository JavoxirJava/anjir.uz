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

  // Uchala so'rov faqat user.id'ga bog'liq, o'zaro mustaqil — parallel olamiz.
  const [{ classes }, subjects, teacherTopics] = await Promise.all([
    getTeacherSubjectsAndClasses(user.id),
    apiGet<Array<{ id: string; name: string }>>("/subjects").catch(() => []),
    apiGet<Array<{ id: string; name: string; fan_subject_id: string | null; fan_subject_name: string | null }>>(`/teachers/${user.id}/subjects`).catch(() => []),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Mavzular</h1>
      <TopicManager subjects={subjects} classes={classes} teacherTopics={teacherTopics} />
    </div>
  );
}
