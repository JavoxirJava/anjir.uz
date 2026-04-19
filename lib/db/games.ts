import { createClient } from "@/lib/supabase/server";

export interface GameRow {
  id: string;
  title: string;
  game_type: "word_match" | "ordering" | "memory";
  subject_id: string | null;
  teacher_id: string;
  data: Record<string, unknown>;
  created_at: string;
  subjects?: { name: string } | null;
}

export interface GameAttemptRow {
  id: string;
  game_id: string;
  student_id: string;
  score: number | null;
  duration_sec: number | null;
  finished_at: string | null;
  created_at: string;
}

/** O'qituvchi o'yinlari */
export async function getGamesByTeacher(teacherId: string): Promise<GameRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*, subjects(name)")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as GameRow[];
}

/** O'yin ma'lumotlari */
export async function getGameById(gameId: string): Promise<GameRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*, subjects(name)")
    .eq("id", gameId)
    .single();

  if (error) return null;
  return data as unknown as GameRow;
}

/** O'quvchi uchun o'yinlar (sinfi bo'yicha) */
export async function getGamesForStudent(classId: string): Promise<GameRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
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
  game_type: string;
  subject_id: string | null;
  teacher_id: string;
  data: Record<string, unknown>;
  classIds: string[];
}): Promise<string> {
  const supabase = await createClient();

  const { data: game, error: gameErr } = await supabase
    .from("games")
    .insert({
      title: input.title,
      game_type: input.game_type,
      subject_id: input.subject_id || null,
      teacher_id: input.teacher_id,
      data: input.data,
    })
    .select("id")
    .single();

  if (gameErr || !game) throw gameErr ?? new Error("Game yaratilmadi");

  if (input.classIds.length > 0) {
    const { error: classErr } = await supabase
      .from("game_classes")
      .insert(input.classIds.map((class_id) => ({ game_id: game.id, class_id })));
    if (classErr) throw classErr;
  }

  return game.id;
}

/** O'yin o'chirish */
export async function deleteGame(gameId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("games").delete().eq("id", gameId);
  if (error) throw error;
}

/** Attempt yaratish */
export async function createGameAttempt(studentId: string, gameId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
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
  const supabase = await createClient();
  const { error } = await supabase
    .from("game_attempts")
    .update({ score, duration_sec: durationSec, finished_at: new Date().toISOString() })
    .eq("id", attemptId);
  if (error) throw error;
}

/** O'quvchining o'yin urinishlari */
export async function getStudentGameAttempts(
  studentId: string,
  gameId: string
): Promise<GameAttemptRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_attempts")
    .select("*")
    .eq("student_id", studentId)
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as GameAttemptRow[];
}
