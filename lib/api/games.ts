import { apiGet, apiPost, apiPut, apiDelete } from "./server";

export type GameRow = {
  id: string;
  title: string;
  template_type: string;
  subject_id: string | null;
  teacher_id: string;
  content_json: Record<string, unknown>;
  created_at: string;
  subjects?: { id: string; name: string } | null;
};

export type GameAttemptRow = {
  id: string;
  game_id: string;
  student_id: string;
  score: number | null;
  duration_sec: number | null;
  finished_at: string | null;
  started_at: string;
};

export async function getGamesByTeacher(teacherId: string): Promise<GameRow[]> {
  return apiGet(`/games?teacher_id=${teacherId}`);
}

export async function getGameById(gameId: string): Promise<GameRow | null> {
  try { return await apiGet(`/games/${gameId}`); } catch { return null; }
}

export async function getGamesForStudent(classId: string): Promise<GameRow[]> {
  return apiGet(`/games?class_id=${classId}`);
}

export async function createGame(input: {
  title: string;
  template_type: string;
  subject_id: string;
  teacher_id: string;
  content_json: Record<string, unknown>;
  classIds: string[];
}): Promise<string> {
  void input.teacher_id;
  const r = await apiPost<{ id: string }>("/games", {
    title:         input.title,
    template_type: input.template_type,
    subject_id:    input.subject_id,
    content_json:  input.content_json,
    class_ids:     input.classIds,
  });
  return r.id;
}

export async function deleteGame(gameId: string): Promise<void> {
  await apiDelete(`/games/${gameId}`);
}

export async function createGameAttempt(studentId: string, gameId: string): Promise<string> {
  void studentId;
  const r = await apiPost<{ attempt_id: string }>(`/games/${gameId}/attempts`, {});
  return r.attempt_id;
}

export async function finishGameAttempt(attemptId: string, score: number, durationSec: number): Promise<void> {
  await apiPut(`/games/attempts/${attemptId}/finish`, { score, duration: durationSec });
}

export async function getStudentGameAttempts(studentId: string, gameId: string): Promise<GameAttemptRow[]> {
  return apiGet(`/games/${gameId}/attempts?student_id=${studentId}`);
}
