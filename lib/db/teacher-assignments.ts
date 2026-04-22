import { createAdminClient } from "@/lib/supabase/admin";

export interface SubjectOption { id: string; name: string }
export interface ClassOption  { id: string; grade: number; letter: string }

/**
 * O'qituvchiga tegishli fanlar va sinflar ro'yxatini qaytaradi.
 * Admin client (RLS bypass) ishlatiladi — PostgREST FK join ishlamaydi
 * chunki FK konfigurasiya qilinmagan, shuning uchun alohida so'rovlar.
 */
export async function getTeacherSubjectsAndClasses(teacherId: string): Promise<{
  subjects: SubjectOption[];
  classes: ClassOption[];
}> {
  const admin = createAdminClient();

  const { data: assignments } = await admin
    .from("teacher_assignments")
    .select("subject_id, class_id")
    .eq("teacher_id", teacherId);

  if (!assignments || assignments.length === 0) {
    return { subjects: [], classes: [] };
  }

  const subjectIds = [...new Set(assignments.map((a) => a.subject_id as string))];
  const classIds   = [...new Set(assignments.map((a) => a.class_id   as string))];

  const [{ data: subjectsRaw }, { data: classesRaw }] = await Promise.all([
    admin.from("subjects").select("id, name").in("id", subjectIds),
    admin.from("classes").select("id, grade, letter").in("id", classIds),
  ]);

  const subjects: SubjectOption[] = (subjectsRaw ?? []).map((s) => ({
    id:   s.id   as string,
    name: s.name as string,
  }));

  const classes: ClassOption[] = (classesRaw ?? []).map((c) => ({
    id:     c.id     as string,
    grade:  c.grade  as number,
    letter: c.letter as string,
  }));

  return { subjects, classes };
}
