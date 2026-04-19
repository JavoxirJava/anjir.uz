import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTestById } from "@/lib/db/tests";
import type { TestInput } from "@/lib/validations/test";
import { TestEditForm } from "./TestEditForm";

export const metadata: Metadata = { title: "Testni tahrirlash — Anjir.uz" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTestPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [test, { data: subjects }, { data: classes }] = await Promise.all([
    getTestById(id),
    supabase.from("subjects").select("id, name").order("name"),
    supabase
      .from("classes")
      .select("id, grade, letter")
      .order("grade")
      .order("letter"),
  ]);

  if (!test || test.teacher_id !== user.id) notFound();

  type SubjectRow = { id: string; name: string };
  type ClassRow = { id: string; grade: number; letter: string };
  type OptionRow = { id?: string; option_text: string; is_correct: boolean };
  type QuestionRow = {
    id?: string;
    question_text: string;
    question_type: "single" | "multiple" | "true_false" | "fill_blank";
    image_url?: string | null;
    image_alt?: string | null;
    points: number;
    order: number;
    question_options?: OptionRow[];
  };

  // TestWithQuestions → TestInput shape
  const initialValues: TestInput = {
    title: test.title,
    description: test.description ?? "",
    subjectId: test.subject_id ?? "",
    classIds: (test.test_classes ?? []).map((tc) => tc.class_id),
    testType: test.test_type,
    timeLimit: test.time_limit ?? null,
    maxAttempts: test.max_attempts ?? null,
    questions: (test.questions as QuestionRow[]).map((q) => ({
      id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      image_url: q.image_url ?? undefined,
      image_alt: q.image_alt ?? undefined,
      points: q.points,
      order: q.order,
      options: (q.question_options ?? []).map((o) => ({
        id: o.id,
        option_text: o.option_text,
        is_correct: o.is_correct,
      })),
    })),
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Testni tahrirlash</h1>
        <p className="text-sm text-muted-foreground mt-1">{test.title}</p>
      </div>

      <TestEditForm
        testId={id}
        initialValues={initialValues}
        subjects={(subjects ?? []) as SubjectRow[]}
        classes={(classes ?? []) as ClassRow[]}
      />
    </div>
  );
}
