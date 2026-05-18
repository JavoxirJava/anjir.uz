import { apiGet, apiPost, apiPut, apiDelete } from "./server";

export type AssignmentRow = {
  id: string;
  title: string;
  description: string | null;
  file_url?: string | null;
  deadline: string | null;
  due_date?: string | null;
  max_score?: number | null;
  subject_id: string | null;
  teacher_id: string;
  created_at: string;
  difficulty_level?: "low" | "medium" | "high";
  is_for_disabled?: boolean;
  subjects?: { id: string; name: string } | null;
  classes?: { id: string; grade: number; letter: string }[] | { id: string; grade: number; letter: string } | null;
  my_progress_state?: "done_pending" | "done_approved" | "done_rejected" | "cannot_do" | null;
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
  first_name?: string;
  last_name?: string;
  difficulty_level?: "low" | "medium" | "high";
  progress_state?: "done_pending" | "done_approved" | "done_rejected" | "cannot_do" | null;
};

export type StudentAssignmentsResponse = {
  assignments: AssignmentRow[];
  level: "low" | "medium" | "high";
  visible_level: "low" | "medium" | "high";
  ready_for_test: boolean;
};

export async function getAssignmentsByTeacher(teacherId: string): Promise<AssignmentRow[]> {
  return apiGet(`/assignments?teacher_id=${teacherId}`);
}

export async function getAssignmentById(id: string): Promise<AssignmentRow | null> {
  try { return await apiGet(`/assignments/${id}`); } catch { return null; }
}

export async function getAssignmentsForStudent(classId: string): Promise<AssignmentRow[]> {
  void classId;
  const response = await apiGet<StudentAssignmentsResponse | AssignmentRow[]>(`/students/me/assignments`);
  if (Array.isArray(response)) {
    return response;
  }
  return response.assignments;
}

export async function getStudentAssignmentsWithLevel(): Promise<StudentAssignmentsResponse> {
  const response = await apiGet<StudentAssignmentsResponse | AssignmentRow[]>(`/students/me/assignments`);
  if (Array.isArray(response)) {
    return {
      assignments: response,
      level: "low",
      visible_level: "low",
      ready_for_test: false,
    };
  }
  return response;
}

export async function createAssignment(input: {
  title: string;
  description: string | null;
  deadline: string | null;
  file_url: string | null;
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
    file_url:         input.file_url,
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

export async function updateAssignmentSubject(id: string, subjectId: string): Promise<void> {
  await apiPut(`/assignments/${id}/subject`, { subject_id: subjectId });
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

export async function updateAssignmentProgress(assignmentId: string, action: "done" | "cannot_do"): Promise<void> {
  await apiPost(`/assignments/${assignmentId}/progress`, { action });
}

export async function reviewAssignmentProgress(submissionId: string, decision: "approve" | "reject"): Promise<void> {
  await apiPut(`/assignments/submissions/${submissionId}/progress-review`, { decision });
}
