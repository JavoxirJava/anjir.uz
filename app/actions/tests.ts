"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/api/auth";
import { createTest, updateTest, deleteTest, finishAttempt } from "@/lib/api/tests";
import { testSchema } from "@/lib/validations/test";
import { uz } from "@/lib/strings/uz";

export async function createTestAction(payload: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: uz.errors.unauthorized };

  const parsed = testSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const testId = await createTest(user.id, parsed.data);
    revalidatePath("/teacher/tests");
    return { success: true, testId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : uz.common.error };
  }
}

export async function updateTestAction(testId: string, payload: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: uz.errors.unauthorized };

  const parsed = testSchema.safeParse(payload);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await updateTest(testId, parsed.data);
    revalidatePath("/teacher/tests");
    revalidatePath(`/teacher/tests/${testId}/edit`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : uz.common.error };
  }
}

export async function deleteTestAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: uz.errors.unauthorized };
  await deleteTest(id);
  revalidatePath("/teacher/tests");
  return { success: true };
}

export async function submitTestAction(
  attemptId: string,
  answers: { questionId: string; selectedOptionIds?: string[]; answerText?: string; isCorrect: boolean }[],
  score: number
) {
  const user = await getCurrentUser();
  if (!user) return { error: uz.errors.unauthorized };
  try {
    await finishAttempt(attemptId, answers, score);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : uz.common.error };
  }
}
