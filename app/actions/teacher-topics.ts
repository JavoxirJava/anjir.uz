"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/api/auth";
import { apiPost } from "@/lib/api/server";

const createTopicSchema = z.object({
  name: z.string().min(2, "Mavzu nomi kamida 2 ta belgi bo'lishi kerak"),
  subjectId: z.string().min(1, "Fan tanlang"),
  classIds: z.array(z.string().uuid()).min(1, "Kamida bitta sinf tanlang"),
});

export async function createTeacherTopicAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const parsed = createTopicSchema.safeParse({
    name: formData.get("name"),
    subjectId: formData.get("subjectId"),
    classIds: formData.getAll("classIds"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const created = await apiPost<{ id: string; name: string; fan_subject_id: string | null; fan_subject_name: string | null }>(`/teachers/${user.id}/subjects`, {
      name: parsed.data.name,
      subject_id: parsed.data.subjectId,
      class_ids: parsed.data.classIds,
    });
    revalidatePath("/teacher/topics");
    revalidatePath("/teacher/lectures/new");
    revalidatePath("/teacher/tests/new");
    revalidatePath("/teacher/assignments/new");
    revalidatePath("/teacher/games/new");
    return { success: true, topic: created };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Mavzu qo'shishda xatolik" };
  }
}
