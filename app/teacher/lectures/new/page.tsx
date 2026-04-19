import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { NewLectureForm } from "./NewLectureForm";

export const metadata: Metadata = {
  title: `${uz.teacher.addLecture} — Anjir.uz`,
};

export default async function NewLecturePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // O'qituvchining fan va sinflari
  const { data: assignments } = await supabase
    .from("teacher_assignments")
    .select("subject_id, class_id, subjects(name), classes(grade, letter)")
    .eq("teacher_id", user!.id);

  // Unikal fanlar
  const subjectMap = new Map<string, string>();
  const classMap = new Map<string, { grade: number; letter: string }>();

  type AssignmentRow = {
    subject_id: string;
    class_id: string;
    subjects?: { name: string } | { name: string }[] | null;
    classes?: { grade: number; letter: string } | { grade: number; letter: string }[] | null;
  };

  (assignments as AssignmentRow[] ?? []).forEach((a) => {
    const subj = Array.isArray(a.subjects) ? a.subjects[0] : a.subjects;
    const cls = Array.isArray(a.classes) ? a.classes[0] : a.classes;
    if (subj) subjectMap.set(a.subject_id, subj.name);
    if (cls) classMap.set(a.class_id, cls);
  });

  const subjects = Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }));
  const classes = Array.from(classMap.entries()).map(([id, c]) => ({ id, ...c }));

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.addLecture}</h1>
      <NewLectureForm subjects={subjects} classes={classes} />
    </div>
  );
}
