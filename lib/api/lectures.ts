import { apiGet, apiPost, apiDelete } from "./server";

export type LectureRow = {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  file_url: string | null;
  subject_id: string | null;
  class_id: string;
  creator_id: string;
  created_at: string;
  subjects?: { id: string; name: string } | null;
  classes?: { id: string; grade: number; letter: string } | null;
  lecture_subtitles?: { id: string; vtt_url: string; source: string }[] | null;
};

export type CreateLectureInput = {
  subject_id: string | null;
  class_id: string | null;
  creator_id?: string;
  title: string;
  description?: string | null;
  content_type: string;
  file_url: string | null;
};

export async function getLecturesByTeacher(teacherId: string): Promise<LectureRow[]> {
  return apiGet(`/lectures?teacher_id=${teacherId}`);
}

export async function getLecturesByClass(classId: string): Promise<LectureRow[]> {
  return apiGet(`/lectures?class_id=${classId}`);
}

export async function getLectureById(id: string): Promise<LectureRow | null> {
  try {
    return await apiGet(`/lectures/${id}`);
  } catch {
    return null;
  }
}

export async function createLecture(
  input: CreateLectureInput & { subtitleVttUrl?: string; subtitleSource?: "manual" | "ai" }
): Promise<string> {
  const result = await apiPost<{ id: string }>("/lectures", {
    subject_id:       input.subject_id,
    class_id:         input.class_id,
    title:            input.title,
    description:      input.description,
    content_type:     input.content_type,
    file_url:         input.file_url,
    subtitle_vtt_url: input.subtitleVttUrl,
    subtitle_source:  input.subtitleSource,
  });
  return result.id;
}

export async function deleteLecture(id: string): Promise<void> {
  await apiDelete(`/lectures/${id}`);
}
