import { createAdminClient } from "@/lib/supabase/admin";

export interface SubjectOption { id: string; name: string }
export interface ClassOption  { id: string; grade: number; letter: string }

/**
 * O'qituvchi content yaratishi uchun:
 * - Fanlar: BARCHA fanlar (subject faqat tag/kategoriya, cheklash shart emas)
 * - Sinflar: faqat teacher_assignments orqali biriktirilgan sinflar
 */
export async function getTeacherSubjectsAndClasses(teacherId: string): Promise<{
  subjects: SubjectOption[];
  classes: ClassOption[];
}> {
  const admin = createAdminClient();

  const [{ data: assignments }, { data: allSubjects }] = await Promise.all([
    admin
      .from("teacher_assignments")
      .select("class_id")
      .eq("teacher_id", teacherId),
    admin
      .from("subjects")
      .select("id, name")
      .order("name"),
  ]);

  const classIds = [...new Set((assignments ?? []).map((a) => a.class_id as string))];

  const { data: classesRaw } = classIds.length
    ? await admin.from("classes").select("id, grade, letter").in("id", classIds)
    : { data: [] };

  const subjects: SubjectOption[] = (allSubjects ?? []).map((s) => ({
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
