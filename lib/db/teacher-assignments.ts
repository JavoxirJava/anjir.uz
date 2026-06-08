import { apiGet } from "@/lib/api/server";

export interface SubjectOption { id: string; name: string }
export interface ClassOption  { id: string; grade: number; letter: string; school_id: string }
export interface SchoolOption { id: string; name: string }
export interface SubjectBySchoolOption extends SubjectOption { school_id: string }
export interface TopicBySchoolOption extends SubjectOption { school_id: string; fan_subject_id: string }

interface TeacherSubjectsAndClassesRaw {
  schools?: SchoolOption[];
  subjects?: Array<{ id: string; name: string; school_id?: string }>;
  topics?: Array<{ id: string; name: string; school_id?: string; fan_subject_id?: string }>;
  classes?: Array<{ id: string; grade: number; letter: string; school_id?: string }>;
}

export async function getTeacherSubjectsAndClasses(teacherId: string): Promise<{
  schools: SchoolOption[];
  subjects: SubjectBySchoolOption[];
  topics: TopicBySchoolOption[];
  classes: ClassOption[];
}> {
  const raw = await apiGet<TeacherSubjectsAndClassesRaw>(
    `/teachers/${teacherId}/subjects-and-classes`
  ).catch((): TeacherSubjectsAndClassesRaw => ({}));

  const schools = Array.isArray(raw.schools) ? raw.schools : [];
  const subjects = Array.isArray(raw.subjects)
    ? raw.subjects.map((s) => ({
        id: s.id,
        name: s.name,
        school_id: s.school_id ?? "",
      }))
    : [];
  const topics = Array.isArray(raw.topics)
    ? raw.topics.map((t) => ({
        id: t.id,
        name: t.name,
        school_id: t.school_id ?? "",
        fan_subject_id: t.fan_subject_id ?? "",
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
