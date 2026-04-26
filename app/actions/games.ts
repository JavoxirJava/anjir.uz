"use server";

import { getCurrentUser } from "@/lib/api/auth";
import { createGame, deleteGame, finishGameAttempt } from "@/lib/api/games";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const gameSchema = z.object({
  title:         z.string().min(3, "Sarlavha kamida 3 ta belgi"),
  template_type: z.enum(["word_match", "ordering", "memory"]),
  subject_id:    z.string().min(1, "Fan tanlanishi shart"),
  classIds:      z.array(z.string()).min(1, "Kamida 1 ta sinf tanlang"),
  content_json:  z.string().min(2, "O'yin ma'lumotlari kiritilishi shart"),
});

export async function createGameAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const raw = {
    title:         formData.get("title"),
    template_type: formData.get("template_type"),
    subject_id:    formData.get("subject_id") || "",
    classIds:      formData.getAll("classIds"),
    content_json:  formData.get("content_json"),
  };

  const parsed = gameSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let parsedData: Record<string, unknown>;
  try { parsedData = JSON.parse(parsed.data.content_json); }
  catch { return { error: "O'yin ma'lumotlari noto'g'ri formatda" }; }

  try {
    const id = await createGame({
      title:         parsed.data.title,
      template_type: parsed.data.template_type,
      subject_id:    parsed.data.subject_id,
      teacher_id:    user.id,
      content_json:  parsedData,
      classIds:      parsed.data.classIds,
    });
    revalidatePath("/teacher/games");
    return { id };
  } catch (err) {
    console.error(err);
    return { error: "O'yin yaratishda xatolik yuz berdi" };
  }
}

export async function deleteGameAction(gameId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  try {
    await deleteGame(gameId);
    revalidatePath("/teacher/games");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "O'yinni o'chirishda xatolik" };
  }
}

export async function finishGameAction(attemptId: string, score: number, durationSec: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  try {
    await finishGameAttempt(attemptId, score, durationSec);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Natija saqlashda xatolik" };
  }
}
