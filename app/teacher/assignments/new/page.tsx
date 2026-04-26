import { getCurrentUser } from "@/lib/api/auth";
import type { Metadata } from "next";
import { getTeacherSubjectsAndClasses } from "@/lib/db/teacher-assignments";
import { uz } from "@/lib/strings/uz";
import { NewAssignmentForm } from "./NewAssignmentForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.teacher.addAssignment} — I-Imkon.uz`,
};

export default async function NewAssignmentPage() {
  const user = await getCurrentUser();

  const { subjects, classes } = await getTeacherSubjectsAndClasses(user!.id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.addAssignment}</h1>
      <NewAssignmentForm subjects={subjects} classes={classes} />
    </div>
  );
}
