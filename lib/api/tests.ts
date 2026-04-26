import { apiGet, apiPost, apiPut, apiDelete } from "./server";
import type { TestInput } from "@/lib/validations/test";

export type QuestionOption = {
  id: string;
  option_text: string;
  is_correct: boolean;
};

export type QuestionRow = {
  id: string;
  question_text: string;
  question_type: string;
  points: number | null;
  image_url?: string | null;
  image_alt?: string | null;
  order?: number;
  question_options: QuestionOption[] | null;
};

export type TestRow = {
  id: string;
  title: string;
  description: string | null;
  time_limit: number | null;
  test_type: string;
  max_attempts: number | null;
  subject_id: string | null;
  teacher_id: string;
  created_at: string;
  subjects?: { id: string; name: string } | null;
};

export type TestWithQuestions = TestRow & {
  questions: QuestionRow[];
  test_classes?: { class_id: string }[];
};

export async function getTestsByTeacher(teacherId: string): Promise<TestRow[]> {
  return apiGet(`/tests?teacher_id=${teacherId}`);
}

export async function getTestsByClass(classId: string): Promise<TestRow[]> {
  return apiGet(`/tests?class_id=${classId}`);
}

export async function getTestById(id: string): Promise<TestWithQuestions | null> {
  try {
    return await apiGet(`/tests/${id}`);
  } catch {
    return null;
  }
}

export async function createTest(teacherId: string, input: TestInput): Promise<string> {
  // teacherId is inferred from JWT on the backend
  void teacherId;
  const result = await apiPost<{ id: string }>("/tests", {
    subject_id:   input.subjectId,
    title:        input.title,
    description:  input.description,
    time_limit:   input.timeLimit,
    test_type:    input.testType,
    max_attempts: input.maxAttempts,
    class_ids:    input.classIds,
    questions:    input.questions,
  });
  return result.id;
}

export async function updateTest(testId: string, input: TestInput): Promise<void> {
  await apiPut(`/tests/${testId}`, {
    subject_id:   input.subjectId,
    title:        input.title,
    description:  input.description,
    time_limit:   input.timeLimit,
    test_type:    input.testType,
    max_attempts: input.maxAttempts,
    class_ids:    input.classIds,
    questions:    input.questions,
  });
}

export async function deleteTest(id: string): Promise<void> {
  await apiDelete(`/tests/${id}`);
}

export async function createAttempt(studentId: string, testId: string): Promise<string> {
  void studentId;
  const result = await apiPost<{ attempt_id: string }>(`/tests/${testId}/attempts`, {});
  return result.attempt_id;
}

export async function finishAttempt(
  attemptId: string,
  answers: { questionId: string; selectedOptionIds?: string[]; answerText?: string; isCorrect: boolean }[],
  score: number
): Promise<void> {
  await apiPost(`/tests/attempts/${attemptId}/finish`, { answers, score });
}

export async function getStudentAttempts(studentId: string, testId: string) {
  void studentId;
  return apiGet<{ id: string; started_at: string; finished_at: string | null; score: number | null }[]>(
    `/tests/${testId}/attempts?student_id=${studentId}`
  );
}
