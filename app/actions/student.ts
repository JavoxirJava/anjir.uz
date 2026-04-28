"use server";

import { getCurrentUser } from "@/lib/api/auth";
import { apiPost } from "@/lib/api/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  classId:  z.string().uuid("Noto'g'ri sinf tanlandi"),
  schoolId: z.string().uuid("Noto'g'ri maktab tanlandi"),
});

export async function updateStudentClassAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const parsed = schema.safeParse({
    classId:  formData.get("classId"),
    schoolId: formData.get("schoolId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await apiPost("/students/profile", {
      school_id: parsed.data.schoolId,
      class_id:  parsed.data.classId,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xatolik" };
  }

  redirect("/pending");
}
