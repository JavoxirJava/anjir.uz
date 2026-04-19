"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createLecture, deleteLecture, addSubtitle } from "@/lib/db/lectures";
import { lectureSchema } from "@/lib/validations/lecture";
import { deleteFromR2, keyFromUrl } from "@/lib/storage/r2";
import { uz } from "@/lib/strings/uz";

export async function createLectureAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: uz.errors.unauthorized };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    subjectId: formData.get("subjectId") as string,
    classId: (formData.get("classId") as string) || undefined,
    contentType: formData.get("contentType") as string,
    fileUrl: formData.get("fileUrl") as string,
    subtitleVttUrl: (formData.get("subtitleVttUrl") as string) || undefined,
    subtitleSource: (formData.get("subtitleSource") as "manual" | "ai") || undefined,
  };

  const parsed = lectureSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const lectureId = await createLecture({
    creator_id: user.id,
    subject_id: parsed.data.subjectId,
    class_id: parsed.data.classId ?? null,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    content_type: parsed.data.contentType,
    file_url: parsed.data.fileUrl,
  });

  // Agar subtitr yuklanganli bo'lsa
  if (parsed.data.subtitleVttUrl) {
    await addSubtitle(
      lectureId,
      parsed.data.subtitleVttUrl,
      parsed.data.subtitleSource ?? "manual"
    );
  }

  revalidatePath("/teacher/lectures");
  redirect("/teacher/lectures");
}

export async function deleteLectureAction(id: string, fileUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: uz.errors.unauthorized };

  // R2 dan faylni o'chirish
  try {
    const key = keyFromUrl(fileUrl);
    await deleteFromR2(key);
  } catch {
    // Fayl topilmasa ham davom etamiz
  }

  await deleteLecture(id);
  revalidatePath("/teacher/lectures");
  return { success: true };
}
