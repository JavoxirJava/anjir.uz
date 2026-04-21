import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { NewAssignmentForm } from "./NewAssignmentForm";

export const metadata: Metadata = {
  title: `${uz.teacher.addAssignment} — I-Imkon.uz`,
};

export default async function NewAssignmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: assignments } = await supabase
    .from("teacher_assignments")
    .select("subject_id, class_id, subjects(name), classes(grade, letter)")
    .eq("teacher_id", user!.id);

  type AssRow = {
    subject_id: string; class_id: string;
    subjects?: { name: string } | { name: string }[] | null;
    classes?: { grade: number; letter: string } | { grade: number; letter: string }[] | null;
  };

  const subjectMap = new Map<string, string>();
  const classMap = new Map<string, { grade: number; letter: string }>();

  ((assignments ?? []) as AssRow[]).forEach((a) => {
    const s = Array.isArray(a.subjects) ? a.subjects[0] : a.subjects;
    const c = Array.isArray(a.classes) ? a.classes[0] : a.classes;
    if (s) subjectMap.set(a.subject_id, s.name);
    if (c) classMap.set(a.class_id, c);
  });

  const subjects = Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }));
  const classes = Array.from(classMap.entries()).map(([id, c]) => ({ id, ...c }));

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.addAssignment}</h1>
      <NewAssignmentForm subjects={subjects} classes={classes} />
    </div>
  );
}
