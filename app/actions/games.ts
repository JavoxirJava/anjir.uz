"use server";

import { createClient } from "@/lib/supabase/server";
import { createGame, deleteGame, finishGameAttempt } from "@/lib/db/games";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const gameSchema = z.object({
  title: z.string().min(3, "Sarlavha kamida 3 ta belgi"),
  game_type: z.enum(["word_match", "ordering", "memory"]),
  subject_id: z.string().optional(),
  classIds: z.array(z.string()).min(1, "Kamida 1 ta sinf tanlang"),
  // JSON serialized game data
  data: z.string().min(2, "O'yin ma'lumotlari kiritilishi shart"),
});

export async function createGameAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const raw = {
    title: formData.get("title"),
    game_type: formData.get("game_type"),
    subject_id: formData.get("subject_id") || undefined,
    classIds: formData.getAll("classIds"),
    data: formData.get("data"),
  };

  const parsed = gameSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let parsedData: Record<string, unknown>;
  try {
    parsedData = JSON.parse(parsed.data.data);
  } catch {
    return { error: "O'yin ma'lumotlari noto'g'ri formatda" };
  }

  try {
    const id = await createGame({
      title: parsed.data.title,
      game_type: parsed.data.game_type,
      subject_id: parsed.data.subject_id ?? null,
      teacher_id: user.id,
      data: parsedData,
      classIds: parsed.data.classIds,
    });
    revalidatePath("/teacher/games");
    return { id };
  } catch (err) {
    console.error(err);
    return { error: "O'yin yaratishda xatolik yuz berdi" };
  }
}

export async function deleteGameAction(gameId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

export async function finishGameAction(
  attemptId: string,
  score: number,
  durationSec: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  try {
    await finishGameAttempt(attemptId, score, durationSec);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Natija saqlashda xatolik" };
  }
}
