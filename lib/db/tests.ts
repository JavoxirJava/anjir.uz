import { createAdminClient } from "@/lib/supabase/admin";
import type { TestInput } from "@/lib/validations/test";

export interface TestRow {
  id: string;
  teacher_id: string;
  subject_id: string;
  title: string;
  description: string | null;
  time_limit: number | null;
  test_type: "entry" | "post_topic" | "home_study";
  max_attempts: number | null;
  created_at: string;
  subjects?: { name: string };
}

export interface QuestionRow {
  id: string;
  test_id: string;
  question_text: string;
  question_type: "single" | "multiple" | "true_false" | "fill_blank";
  image_url: string | null;
  image_alt: string | null;
  points: number;
  order: number;
  question_options?: OptionRow[];
}

export interface OptionRow {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
}

export interface TestWithQuestions extends TestRow {
  questions: QuestionRow[];
  test_classes?: { class_id: string }[];
}

export async function getTestsByTeacher(teacherId: string): Promise<TestRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("tests")
    .select("*, subjects(name)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as TestRow[];
}

export async function getTestById(id: string): Promise<TestWithQuestions | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("tests")
    .select(`
      *,
      subjects(name),
      test_classes(class_id),
      questions(
        *,
        question_options(*)
      )
    `)
    .eq("id", id)
    .order("order", { referencedTable: "questions" })
    .single();
  return data as unknown as TestWithQuestions ?? null;
}

export async function createTest(
  teacherId: string,
  input: TestInput
): Promise<string> {
  // Admin client: RLS policy sirkular rekursiyasini oldini olish uchun
  // (test_classes_manage_teacher ↔ tests_select_teacher loop)
  const admin = createAdminClient();

  // 1. Test yaratish
  const { data: test, error } = await admin
    .from("tests")
    .insert({
      teacher_id: teacherId,
      subject_id: input.subjectId,
      title: input.title,
      description: input.description ?? null,
      time_limit: input.timeLimit ?? null,
      test_type: input.testType,
      max_attempts: input.maxAttempts ?? null,
    })
    .select("id")
    .single();

  if (error || !test) throw new Error(error?.message ?? "Test yaratishda xatolik");

  const testId = test.id;

  // 2. Sinflar biriktirishsin
  if (input.classIds.length > 0) {
    await admin.from("test_classes").insert(
      input.classIds.map((cid) => ({ test_id: testId, class_id: cid }))
    );
  }

  // 3. Savollar va variantlar
  for (const [i, q] of input.questions.entries()) {
    const { data: question } = await admin
      .from("questions")
      .insert({
        test_id: testId,
        question_text: q.question_text,
        question_type: q.question_type,
        image_url: q.image_url ?? null,
        image_alt: q.image_alt ?? null,
        points: q.points,
        order: i,
      })
      .select("id")
      .single();

    if (!question) continue;

    // Variantlar (true_false va fill_blank uchun ham)
    const options = getOptionsForType(q);
    if (options.length > 0) {
      await admin.from("question_options").insert(
        options.map((o) => ({
          question_id: question.id,
          option_text: o.option_text,
          is_correct: o.is_correct,
        }))
      );
    }
  }

  return testId;
}

function getOptionsForType(q: TestInput["questions"][0]) {
  if (q.question_type === "true_false") {
    return [
      { option_text: "To'g'ri", is_correct: q.options?.[0]?.is_correct ?? true },
      { option_text: "Noto'g'ri", is_correct: !(q.options?.[0]?.is_correct ?? true) },
    ];
  }
  return q.options ?? [];
}

export async function updateTest(
  testId: string,
  input: TestInput
): Promise<void> {
  const admin = createAdminClient();

  // 1. Test ma'lumotlarini yangilash
  await admin
    .from("tests")
    .update({
      subject_id: input.subjectId,
      title: input.title,
      description: input.description ?? null,
      time_limit: input.timeLimit ?? null,
      test_type: input.testType,
      max_attempts: input.maxAttempts ?? null,
    })
    .eq("id", testId);

  // 2. Eski sinflarni o'chirib, yangilarini qo'shish
  await admin.from("test_classes").delete().eq("test_id", testId);
  if (input.classIds.length > 0) {
    await admin.from("test_classes").insert(
      input.classIds.map((cid) => ({ test_id: testId, class_id: cid }))
    );
  }

  // 3. Eski savollarni o'chirib, yangilarini qo'shish (cascade deletes options)
  await admin.from("questions").delete().eq("test_id", testId);

  for (const [i, q] of input.questions.entries()) {
    const { data: question } = await admin
      .from("questions")
      .insert({
        test_id: testId,
        question_text: q.question_text,
        question_type: q.question_type,
        image_url: q.image_url ?? null,
        image_alt: q.image_alt ?? null,
        points: q.points,
        order: i,
      })
      .select("id")
      .single();

    if (!question) continue;

    const options = getOptionsForType(q);
    if (options.length > 0) {
      await admin.from("question_options").insert(
        options.map((o) => ({
          question_id: question.id,
          option_text: o.option_text,
          is_correct: o.is_correct,
        }))
      );
    }
  }
}

export async function deleteTest(id: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("tests").delete().eq("id", id);
}

// O'quvchi uchun attempt yaratish
export async function createAttempt(
  studentId: string,
  testId: string
): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("test_attempts")
    .insert({ student_id: studentId, test_id: testId, started_at: new Date().toISOString() })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

// Natija saqlash
export async function finishAttempt(
  attemptId: string,
  answers: { questionId: string; selectedOptionIds?: string[]; answerText?: string; isCorrect: boolean }[],
  score: number
): Promise<void> {
  const admin = createAdminClient();

  await admin
    .from("test_attempts")
    .update({ finished_at: new Date().toISOString(), score })
    .eq("id", attemptId);

  if (answers.length > 0) {
    await admin.from("test_answers").insert(
      answers.map((a) => ({
        attempt_id: attemptId,
        question_id: a.questionId,
        answer_text: a.answerText ?? null,
        selected_option_ids: a.selectedOptionIds ?? null,
        is_correct: a.isCorrect,
      }))
    );
  }
}

// O'quvchining oldingi urinishlari
export async function getStudentAttempts(
  studentId: string,
  testId: string
) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("test_attempts")
    .select("id, started_at, finished_at, score")
    .eq("student_id", studentId)
    .eq("test_id", testId)
    .order("started_at", { ascending: false });
  return data ?? [];
}
