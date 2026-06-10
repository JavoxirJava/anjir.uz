"use server";

import { getCurrentUser } from "@/lib/api/auth";
import { createGame, deleteGame, finishGameAttempt, updateGameSubject } from "@/lib/api/games";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const gameSchema = z.object({
  title:         z.string().min(3, "Sarlavha kamida 3 ta belgi"),
  template_type: z.enum(["word_match", "ordering", "memory", "external"]),
  topic_id:      z.string().optional(),
  external_url:  z.string().url("Tashqi havola noto'g'ri formatda").optional().or(z.literal("")),
  classIds:      z.array(z.string()).min(1, "Kamida 1 ta sinf tanlang"),
  content_json:  z.string().optional().default("{}"),
});

export async function createGameAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const raw = {
    title:         formData.get("title"),
    template_type: formData.get("template_type"),
    topic_id:      formData.get("topic_id") || undefined,
    external_url:  (formData.get("external_url") as string) || "",
    classIds:      formData.getAll("classIds"),
    content_json:  formData.get("content_json"),
  };

  const parsed = gameSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let parsedData: Record<string, unknown>;
  try { parsedData = JSON.parse(parsed.data.content_json ?? "{}"); }
  catch { return { error: "O'yin ma'lumotlari noto'g'ri formatda" }; }

  try {
    const id = await createGame({
      title:         parsed.data.title,
      template_type: parsed.data.template_type,
      topic_id:      parsed.data.topic_id ?? null,
      external_url:  parsed.data.external_url || null,
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

export async function updateGameSubjectAction(gameId: string, topicId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  if (!topicId) return { error: "Mavzu tanlanishi shart" };

  try {
    await updateGameSubject(gameId, topicId);
    revalidatePath("/teacher/games");
    revalidatePath("/app/games");
    return { success: true };
  } catch {
    return { error: "Mavzuni yangilashda xatolik" };
  }
}
