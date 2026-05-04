import { apiGet, apiPost, apiPut, apiDelete } from "./server";

export type AssignmentRow = {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  due_date?: string | null;
  max_score?: number | null;
  subject_id: string | null;
  teacher_id: string;
  created_at: string;
  subjects?: { id: string; name: string } | null;
};

export type SubmissionRow = {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  file_url: string | null;
  score: number | null;
  teacher_comment: string | null;
  submitted_at: string;
  graded_at?: string | null;
  users?: { id: string; first_name: string; last_name: string } | null;
};

export async function getAssignmentsByTeacher(teacherId: string): Promise<AssignmentRow[]> {
  return apiGet(`/assignments?teacher_id=${teacherId}`);
}

export async function getAssignmentById(id: string): Promise<AssignmentRow | null> {
  try { return await apiGet(`/assignments/${id}`); } catch { return null; }
}

export async function getAssignmentsForStudent(classId: string): Promise<AssignmentRow[]> {
  return apiGet(`/assignments?class_id=${classId}`);
}

export async function createAssignment(input: {
  title: string;
  description: string | null;
  deadline: string | null;
  teacher_id: string;
  subject_id: string;
  classIds: string[];
  difficulty_level: "low" | "medium" | "high";
  is_for_disabled: boolean;
}): Promise<string> {
  void input.teacher_id;
  const r = await apiPost<{ id: string }>("/assignments", {
    title:            input.title,
    description:      input.description,
    deadline:         input.deadline,
    subject_id:       input.subject_id,
    class_ids:        input.classIds,
    difficulty_level: input.difficulty_level,
    is_for_disabled:  input.is_for_disabled,
  });
  return r.id;
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiDelete(`/assignments/${id}`);
}

export async function submitAssignment(input: {
  assignment_id: string;
  student_id: string;
  text: string | null;
  file_url: string | null;
}): Promise<string> {
  void input.student_id;
  const r = await apiPost<{ id: string }>(`/assignments/${input.assignment_id}/submit`, {
    content:  input.text,
    file_url: input.file_url,
  });
  return r.id;
}

export async function getStudentSubmission(
  assignmentId: string,
  studentId: string
): Promise<SubmissionRow | null> {
  void studentId;
  return apiGet(`/assignments/${assignmentId}/submission`);
}

export async function getSubmissionsForAssignment(assignmentId: string): Promise<SubmissionRow[]> {
  return apiGet(`/assignments/${assignmentId}/submissions`);
}

export async function gradeSubmission(submissionId: string, grade: number, comment: string | null): Promise<void> {
  await apiPut(`/assignments/submissions/${submissionId}/grade`, { score: grade, teacher_comment: comment });
}
