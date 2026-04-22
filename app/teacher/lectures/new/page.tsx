import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { uz } from "@/lib/strings/uz";
import { NewLectureForm } from "./NewLectureForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.teacher.addLecture} — I-Imkon.uz`,
};

export default async function NewLecturePage() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  const { subjects, classes } = await getTeacherSubjectsAndClasses(user!.id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.addLecture}</h1>
      <NewLectureForm subjects={subjects} classes={classes} />
    </div>
  );
}
