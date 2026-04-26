"use server";

import { getCurrentUser } from "@/lib/api/auth";
import { apiPost, apiPut, apiDelete } from "@/lib/api/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().min(1, "Ism kiritilishi shart").max(50),
  lastName:  z.string().min(1, "Familiya kiritilishi shart").max(50),
});

export async function updateTeacherProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const parsed = profileSchema.safeParse({
    firstName: (formData.get("firstName") as string) || "",
    lastName:  (formData.get("lastName")  as string) || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await apiPut(`/users/${user.id}`, {
      first_name: parsed.data.firstName,
      last_name:  parsed.data.lastName,
    });
    revalidatePath("/teacher/settings");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function addTeacherAssignmentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const schoolId  = (formData.get("schoolId")  as string) || "";
  const subjectId = (formData.get("subjectId") as string) || "";
  const classIds  = formData.getAll("classIds") as string[];

  if (!schoolId)             return { error: "Maktab tanlanishi shart" };
  if (!subjectId)            return { error: "Fan tanlanishi shart" };
  if (classIds.length === 0) return { error: "Kamida bitta sinf tanlang" };

  try {
    await apiPost("/teachers/assignments", {
      school_id:  schoolId,
      subject_id: subjectId,
      class_ids:  classIds,
    });
    revalidatePath("/teacher/settings");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function approveStudentAction(userId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  try {
    await apiPut(`/students/approve/${userId}`, {});
    revalidatePath("/teacher/students");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function rejectStudentAction(userId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  try {
    await apiPut(`/students/reject/${userId}`, { reason });
    revalidatePath("/teacher/students");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function removeTeacherSchoolAction(schoolId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  try {
    await apiDelete(`/teachers/assignments/${schoolId}`);
    revalidatePath("/teacher/settings");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function updateTeacherPasswordAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const password = (formData.get("password") as string) || "";
  if (password.length < 8) return { error: "Parol kamida 8 ta belgi" };

  try {
    await apiPost("/auth/change-password", { password });
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xatolik" };
  }
}
