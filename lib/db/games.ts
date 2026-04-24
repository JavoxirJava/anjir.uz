import { createAdminClient } from "@/lib/supabase/admin";

export interface GameRow {
  id: string;
  title: string;
  template_type: "word_match" | "ordering" | "memory";
  subject_id: string;
  teacher_id: string;
  content_json: Record<string, unknown>;
  created_at: string;
  subjects?: { name: string } | null;
}

export interface GameAttemptRow {
  id: string;
  game_id: string;
  student_id: string;
  score: number;
  duration: number;
  completed_at: string;
}

/** O'qituvchi o'yinlari */
export async function getGamesByTeacher(teacherId: string): Promise<GameRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("games")
    .select("*, subjects(name)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as GameRow[];
}

/** O'yin ma'lumotlari */
export async function getGameById(gameId: string): Promise<GameRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("games")
    .select("*, subjects(name)")
    .eq("id", gameId)
    .single();

  if (error) return null;
  return data as unknown as GameRow;
}

/** O'quvchi uchun o'yinlar (sinfi bo'yicha) */
export async function getGamesForStudent(classId: string): Promise<GameRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("games")
    .select("*, subjects(name), game_classes!inner(class_id)")
    .eq("game_classes.class_id", classId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as GameRow[];
}

/** O'yin yaratish */
export async function createGame(input: {
  title: string;
  template_type: string;
  subject_id: string;
  teacher_id: string;
  content_json: Record<string, unknown>;
  classIds: string[];
}): Promise<string> {
  const admin = createAdminClient();

  const { data: game, error: gameErr } = await admin
    .from("games")
    .insert({
      title: input.title,
      template_type: input.template_type,
      subject_id: input.subject_id,
      teacher_id: input.teacher_id,
      content_json: input.content_json,
    })
    .select("id")
    .single();

  if (gameErr || !game) throw new Error("Game yaratilmadi: " + (gameErr?.message ?? "noma'lum xato"));

  if (input.classIds.length > 0) {
    const { error: classErr } = await admin
      .from("game_classes")
      .insert(input.classIds.map((class_id) => ({ game_id: game.id, class_id })));
    if (classErr) throw classErr;
  }

  return game.id;
}

/** O'yin o'chirish */
export async function deleteGame(gameId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("games").delete().eq("id", gameId);
  if (error) throw error;
}

/** Attempt yaratish */
export async function createGameAttempt(studentId: string, gameId: string): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("game_attempts")
    .insert({ student_id: studentId, game_id: gameId })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Attempt yaratilmadi");
  return data.id;
}

/** Attempt yakunlash */
export async function finishGameAttempt(
  attemptId: string,
  score: number,
  durationSec: number
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("game_attempts")
    .update({
      score,
      duration:     durationSec,
      completed_at: new Date().toISOString(),
    })
    .eq("id", attemptId);

  if (error) throw new Error(error.message);
}

/** O'quvchining o'yin urinishlari */
export async function getStudentGameAttempts(
  studentId: string,
  gameId: string
): Promise<GameAttemptRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("game_attempts")
    .select("*")
    .eq("student_id", studentId)
    .eq("game_id", gameId)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as GameAttemptRow[];
}
