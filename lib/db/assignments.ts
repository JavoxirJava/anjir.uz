import { createAdminClient } from "@/lib/supabase/admin";

export interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  teacher_id: string;
  subject_id: string;
  class_id: string;
  file_url: string | null;
  created_at: string;
  subjects?: { name: string } | null;
}

export interface SubmissionRow {
  id: string;
  assignment_id: string;
  student_id: string;
  text: string | null;
  file_url: string | null;
  grade: number | null;
  comment: string | null;
  submitted_at: string | null;
  users?: { first_name: string; last_name: string } | null;
}

/** O'qituvchi vazifalar ro'yxati */
export async function getAssignmentsByTeacher(teacherId: string): Promise<AssignmentRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("assignments")
    .select("*, subjects(name)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AssignmentRow[];
}

/** Bitta vazifa */
export async function getAssignmentById(id: string): Promise<AssignmentRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("assignments")
    .select("*, subjects(name)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as AssignmentRow;
}

/** O'quvchi uchun vazifalar (sinf bo'yicha) */
export async function getAssignmentsForStudent(classId: string): Promise<AssignmentRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("assignments")
    .select("*, subjects(name)")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AssignmentRow[];
}

/** Vazifa yaratish — har bir sinf uchun alohida qator */
export async function createAssignment(input: {
  title: string;
  description: string | null;
  deadline: string | null;
  teacher_id: string;
  subject_id: string;
  classIds: string[];
}): Promise<string> {
  const admin = createAdminClient();

  const base = {
    title: input.title,
    description: input.description,
    deadline: input.deadline,
    teacher_id: input.teacher_id,
    subject_id: input.subject_id,
  };

  // Insert first row separately to get ID
  const { data, error } = await admin
    .from("assignments")
    .insert({ ...base, class_id: input.classIds[0] })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Vazifa yaratilmadi");

  // Insert remaining rows (if multiple classes selected)
  if (input.classIds.length > 1) {
    const { error: restErr } = await admin
      .from("assignments")
      .insert(input.classIds.slice(1).map((class_id) => ({ ...base, class_id })));
    if (restErr) throw restErr;
  }

  return data.id;
}

/** Vazifani o'chirish */
export async function deleteAssignment(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("assignments").delete().eq("id", id);
  if (error) throw error;
}

/** Topshiriq yuborish (student) */
export async function submitAssignment(input: {
  assignment_id: string;
  student_id: string;
  text: string | null;
  file_url: string | null;
}): Promise<string> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("assignment_submissions")
    .select("id")
    .eq("assignment_id", input.assignment_id)
    .eq("student_id", input.student_id)
    .single();

  if (existing) {
    await admin
      .from("assignment_submissions")
      .update({ text: input.text, file_url: input.file_url })
      .eq("id", existing.id);
    return existing.id;
  }

  const { data, error } = await admin
    .from("assignment_submissions")
    .insert({
      assignment_id: input.assignment_id,
      student_id: input.student_id,
      text: input.text,
      file_url: input.file_url,
    })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Topshiriq yuborilmadi");
  return data.id;
}

/** O'quvchi topshirig'i */
export async function getStudentSubmission(
  assignmentId: string,
  studentId: string
): Promise<SubmissionRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("assignment_submissions")
    .select("*")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .single();
  return data as unknown as SubmissionRow | null;
}

/** Vazifa topshiriqlarini ko'rish (o'qituvchi) */
export async function getSubmissionsForAssignment(
  assignmentId: string
): Promise<SubmissionRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("assignment_submissions")
    .select("*, users(first_name, last_name)")
    .eq("assignment_id", assignmentId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as SubmissionRow[];
}

/** Baholash (o'qituvchi) */
export async function gradeSubmission(
  submissionId: string,
  grade: number,
  comment: string | null
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("assignment_submissions")
    .update({ grade, comment })
    .eq("id", submissionId);
  if (error) throw error;
}
