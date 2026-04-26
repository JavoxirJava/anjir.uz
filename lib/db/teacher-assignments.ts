import { apiGet } from "@/lib/api/server";

export interface SubjectOption { id: string; name: string }
export interface ClassOption  { id: string; grade: number; letter: string }

export async function getTeacherSubjectsAndClasses(teacherId: string): Promise<{
  subjects: SubjectOption[];
  classes: ClassOption[];
}> {
  return apiGet<{ subjects: SubjectOption[]; classes: ClassOption[] }>(
    `/teachers/${teacherId}/subjects-and-classes`
  ).catch(() => ({ subjects: [], classes: [] }));
}
