import { createClient } from "@/lib/supabase/server";

export interface AssignmentRow {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number;
  teacher_id: string;
  subject_id: string | null;
  created_at: string;
  subjects?: { name: string } | null;
}

export interface SubmissionRow {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  file_url: string | null;
  score: number | null;
  teacher_comment: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  created_at: string;
  users?: {
    first_name: string;
    last_name: string;
  } | null;
}

/** O'qituvchi vazifalar ro'yxati */
export async function getAssignmentsByTeacher(teacherId: string): Promise<AssignmentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("*, subjects(name)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AssignmentRow[];
}

/** Bitta vazifa */
export async function getAssignmentById(id: string): Promise<AssignmentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assignments")
    .select("*, subjects(name)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as AssignmentRow;
}

/** O'quvchi uchun vazifalar (sinf bo'yicha) */
export async function getAssignmentsForStudent(classId: string): Promise<AssignmentRow[]> {
  const supabase = await createClient();
  // Try junction table first, fallback to direct class_id
  const { data, error } = await supabase
    .from("assignments")
    .select("*, subjects(name)")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AssignmentRow[];
}

/** Vazifa topshirig'ini yaratish */
export async function createAssignment(input: {
  title: string;
  description: string | null;
  due_date: string | null;
  max_score: number;
  teacher_id: string;
  subject_id: string | null;
  classIds: string[];
}): Promise<string> {
  const supabase = await createClient();

  // Birinchi sinfga yaratish (asosiy), qolganlariga klon
  const primaryClassId = input.classIds[0];

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      title: input.title,
      description: input.description,
      due_date: input.due_date,
      max_score: input.max_score,
      teacher_id: input.teacher_id,
      subject_id: input.subject_id,
      class_id: primaryClassId,
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Vazifa yaratilmadi");

  // Qolgan sinflar uchun ham yaratish
  if (input.classIds.length > 1) {
    const rest = input.classIds.slice(1);
    for (const class_id of rest) {
      await supabase.from("assignments").insert({
        title: input.title,
        description: input.description,
        due_date: input.due_date,
        max_score: input.max_score,
        teacher_id: input.teacher_id,
        subject_id: input.subject_id,
        class_id,
      });
    }
  }

  return data.id;
}

/** Vazifani o'chirish */
export async function deleteAssignment(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) throw error;
}

/** Topshiriq yuborish (student) */
export async function submitAssignment(input: {
  assignment_id: string;
  student_id: string;
  content: string | null;
  file_url: string | null;
}): Promise<string> {
  const supabase = await createClient();

  // Avval mavjud submission-ni tekshirish
  const { data: existing } = await supabase
    .from("assignment_submissions")
    .select("id")
    .eq("assignment_id", input.assignment_id)
    .eq("student_id", input.student_id)
    .single();

  if (existing) {
    // Yangilash
    const { error } = await supabase
      .from("assignment_submissions")
      .update({
        content: input.content,
        file_url: input.file_url,
        submitted_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from("assignment_submissions")
    .insert({
      ...input,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Topshiriq yuborilmadi");
  return data.id;
}

/** O'quvchi topshirig'i */
export async function getStudentSubmission(
  assignmentId: string,
  studentId: string
): Promise<SubmissionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
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
  const supabase = await createClient();
  const { data, error } = await supabase
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
  score: number,
  comment: string | null
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("assignment_submissions")
    .update({ score, teacher_comment: comment, graded_at: new Date().toISOString() })
    .eq("id", submissionId);
  if (error) throw error;
}
