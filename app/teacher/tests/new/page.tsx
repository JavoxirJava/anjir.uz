import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { uz } from "@/lib/strings/uz";
import { TestBuilderForm } from "./TestBuilderForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.teacher.addTest} — I-Imkon.uz`,
};

export default async function NewTestPage() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  const { subjects, classes } = await getTeacherSubjectsAndClasses(user!.id);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.addTest}</h1>
      <TestBuilderForm subjects={subjects} classes={classes} />
    </div>
  );
}
