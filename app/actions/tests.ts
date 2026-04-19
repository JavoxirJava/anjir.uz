"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createTest, deleteTest, finishAttempt } from "@/lib/db/tests";
import { testSchema } from "@/lib/validations/test";
import { uz } from "@/lib/strings/uz";

export async function createTestAction(payload: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: uz.errors.unauthorized };

  const parsed = testSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const testId = await createTest(user.id, parsed.data);
    revalidatePath("/teacher/tests");
    return { success: true, testId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : uz.common.error };
  }
}

export async function deleteTestAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: uz.errors.unauthorized };

  await deleteTest(id);
  revalidatePath("/teacher/tests");
  return { success: true };
}

export async function submitTestAction(
  attemptId: string,
  answers: {
    questionId: string;
    selectedOptionIds?: string[];
    answerText?: string;
    isCorrect: boolean;
  }[],
  score: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: uz.errors.unauthorized };

  try {
    await finishAttempt(attemptId, answers, score);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : uz.common.error };
  }
}
