"use server";

import { getCurrentUser } from "@/lib/api/auth";
import { apiPost } from "@/lib/api/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  classId: z.string().uuid("Noto'g'ri sinf tanlandi"),
});

export async function updateStudentClassAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const parsed = schema.safeParse({ classId: formData.get("classId") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await apiPost("/students/profile", {
      class_id: parsed.data.classId,
    });
    await apiPost(`/students/profile`, { class_id: parsed.data.classId, school_id: "" });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xatolik" };
  }

  redirect("/pending");
}
