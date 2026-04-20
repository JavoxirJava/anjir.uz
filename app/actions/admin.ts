"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function approveUserAction(userId: string) {
  const admin = createAdminClient();
  await admin.from("users").update({ status: "active" }).eq("id", userId);
  revalidatePath("/admin/users");
  return { success: true };
}

export async function rejectUserAction(userId: string, reason?: string) {
  const admin = createAdminClient();
  await admin.from("users").update({ status: "rejected" }).eq("id", userId);
  if (reason) {
    await admin.from("student_profiles").update({ rejection_reason: reason }).eq("user_id", userId);
  }
  revalidatePath("/admin/users");
  return { success: true };
}
