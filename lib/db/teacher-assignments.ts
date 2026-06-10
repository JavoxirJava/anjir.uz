import { apiGet } from "@/lib/api/server";

export interface SubjectOption { id: string; name: string }
export interface ClassOption  { id: string; grade: number; letter: string; school_id: string }
export interface SchoolOption { id: string; name: string }
export interface SubjectBySchoolOption extends SubjectOption { school_id?: string }
export interface TopicOption extends SubjectOption { subject_id: string; subject_name: string }

interface TeacherSubjectsAndClassesRaw {
  schools?: SchoolOption[];
  subjects?: Array<{ id: string; name: string }>;
  topics?: Array<{ id: string; name: string; subject_id?: string; subject_name?: string }>;
  classes?: Array<{ id: string; grade: number; letter: string; school_id?: string }>;
}

export async function getTeacherSubjectsAndClasses(teacherId: string): Promise<{
  schools: SchoolOption[];
  subjects: SubjectBySchoolOption[];
  topics: TopicOption[];
  classes: ClassOption[];
}> {
  const raw = await apiGet<TeacherSubjectsAndClassesRaw>(
    `/teachers/${teacherId}/subjects-and-classes`
  ).catch((): TeacherSubjectsAndClassesRaw => ({}));

  const schools = Array.isArray(raw.schools) ? raw.schools : [];
  const subjects = Array.isArray(raw.subjects)
    ? raw.subjects.map((s) => ({ id: s.id, name: s.name }))
    : [];
  const topics = Array.isArray(raw.topics)
    ? raw.topics.map((t) => ({
        id: t.id,
        name: t.name,
        subject_id: t.subject_id ?? "",
        subject_name: t.subject_name ?? "",
      }))
    : [];
  const classes = Array.isArray(raw.classes)
    ? raw.classes.map((c) => ({
        id: c.id,
        grade: c.grade,
        letter: c.letter,
        school_id: c.school_id ?? "",
      }))
    : [];

  return { schools, subjects, topics, classes };
}
