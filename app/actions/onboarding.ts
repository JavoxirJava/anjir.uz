"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function saveEntryTestAction(
  testId: string,
  answers: Record<string, string>,
  correct: number,
  total: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const admin = createAdminClient();

  // test_attempts ga yoz
  const { data: attempt } = await admin
    .from("test_attempts")
    .insert({
      student_id: user.id,
      test_id: testId,
      score: total > 0 ? Math.round((correct / total) * 100) : 0,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (!attempt) return { error: "Saqlashda xatolik" };

  // test_answers ga yoz
  const answerRows = Object.entries(answers).map(([questionId, optionId]) => ({
    attempt_id: attempt.id,
    question_id: questionId,
    answer_text: optionId,
    is_correct: false, // keyinroq hisoblanadi
  }));

  if (answerRows.length > 0) {
    await admin.from("test_answers").insert(answerRows);
  }

  return { success: true };
}
