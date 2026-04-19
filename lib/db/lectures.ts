import { createClient } from "@/lib/supabase/server";

export interface LectureRow {
  id: string;
  creator_id: string;
  school_id: string | null;
  subject_id: string;
  class_id: string | null;
  title: string;
  description: string | null;
  content_type: "pdf" | "video" | "audio" | "ppt";
  file_url: string;
  created_at: string;
  subjects?: { name: string };
  classes?: { grade: number; letter: string } | null;
  lecture_subtitles?: { vtt_url: string; source: string }[];
}

export interface CreateLectureInput {
  creator_id: string;
  school_id?: string | null;
  subject_id: string;
  class_id?: string | null;
  title: string;
  description?: string | null;
  content_type: "pdf" | "video" | "audio" | "ppt";
  file_url: string;
}

export async function getLecturesByTeacher(teacherId: string): Promise<LectureRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lectures")
    .select(`
      *,
      subjects(name),
      classes(grade, letter),
      lecture_subtitles(vtt_url, source)
    `)
    .eq("creator_id", teacherId)
    .order("created_at", { ascending: false });
  return (data as LectureRow[]) ?? [];
}

export async function getLecturesByClass(classId: string): Promise<LectureRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lectures")
    .select(`
      *,
      subjects(name),
      lecture_subtitles(vtt_url, source)
    `)
    .eq("class_id", classId)
    .order("created_at", { ascending: false });
  return (data as LectureRow[]) ?? [];
}

export async function getLectureById(id: string): Promise<LectureRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lectures")
    .select(`
      *,
      subjects(name),
      classes(grade, letter),
      lecture_subtitles(id, vtt_url, language, source)
    `)
    .eq("id", id)
    .single();
  return (data as LectureRow) ?? null;
}

export async function createLecture(input: CreateLectureInput): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lectures")
    .insert(input)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function deleteLecture(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("lectures").delete().eq("id", id);
}

export async function addSubtitle(
  lectureId: string,
  vttUrl: string,
  source: "manual" | "ai"
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("lecture_subtitles").upsert({
    lecture_id: lectureId,
    vtt_url: vttUrl,
    language: "uz",
    source,
  });
}
