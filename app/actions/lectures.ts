"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { createLecture, deleteLecture } from "@/lib/api/lectures";
import { lectureSchema } from "@/lib/validations/lecture";
import { deleteFromR2, keyFromUrl } from "@/lib/storage/r2";
import { uz } from "@/lib/strings/uz";

export async function createLectureAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: uz.errors.unauthorized };

  const raw = {
    title:          formData.get("title") as string,
    description:    (formData.get("description") as string) || undefined,
    subjectId:      formData.get("subjectId") as string,
    classId:        (formData.get("classId") as string) || undefined,
    contentType:    formData.get("contentType") as string,
    fileUrl:        formData.get("fileUrl") as string,
    subtitleVttUrl: (formData.get("subtitleVttUrl") as string) || undefined,
    subtitleSource: (formData.get("subtitleSource") as "manual" | "ai") || undefined,
  };

  const parsed = lectureSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await createLecture({
      creator_id:     user.id,
      subject_id:     parsed.data.subjectId,
      class_id:       parsed.data.classId ?? null,
      title:          parsed.data.title,
      description:    parsed.data.description ?? null,
      content_type:   parsed.data.contentType as "pdf" | "video" | "audio" | "ppt",
      file_url:       parsed.data.fileUrl,
      subtitleVttUrl: parsed.data.subtitleVttUrl,
      subtitleSource: parsed.data.subtitleSource,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : uz.common.error };
  }

  revalidatePath("/teacher/lectures");
  redirect("/teacher/lectures");
}

export async function deleteLectureAction(id: string, fileUrl: string) {
  const user = await getCurrentUser();
  if (!user) return { error: uz.errors.unauthorized };

  try {
    const key = keyFromUrl(fileUrl);
    await deleteFromR2(key);
  } catch { /* continue */ }

  await deleteLecture(id);
  revalidatePath("/teacher/lectures");
  return { success: true };
}
