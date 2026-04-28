"use server";

import { getCurrentUser } from "@/lib/api/auth";
import { apiPut } from "@/lib/api/server";
import { revalidatePath } from "next/cache";

export async function approveParentAction(userId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  try {
    await apiPut(`/parents/approve/${userId}`, {});
    revalidatePath("/director/parents");
    revalidatePath("/teacher/parents");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xatolik" };
  }
}

export async function rejectParentAction(userId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  try {
    await apiPut(`/parents/reject/${userId}`, {});
    revalidatePath("/director/parents");
    revalidatePath("/teacher/parents");
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
    revalidatePath("/director/students");
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
    revalidatePath("/director/students");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Xatolik" };
  }
}
