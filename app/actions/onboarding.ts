"use server";

import { getCurrentUser } from "@/lib/api/auth";
import { apiPost } from "@/lib/api/server";

export async function saveEntryTestAction(
  testId: string,
  answers: Record<string, string>,
  correct: number,
  total: number
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  try {
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const { attempt_id } = await apiPost<{ attempt_id: string }>(`/tests/${testId}/attempts`, {});
    await apiPost(`/tests/attempts/${attempt_id}/finish`, {
      answers: Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        selectedOptionIds: [optionId],
        isCorrect: false,
      })),
      score,
    });
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Saqlashda xatolik" };
  }
}
