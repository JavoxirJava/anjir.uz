"use server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function approveStudentAction(userId: string) {
  const admin = createAdminClient();
  await admin.from("users").update({ status: "active" }).eq("id", userId);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await admin.from("student_profiles").update({
    approved_by: user?.id ?? null,
    approved_at: new Date().toISOString(),
  }).eq("user_id", userId);
  revalidatePath("/director/students");
  return { success: true };
}

export async function rejectStudentAction(userId: string, reason: string) {
  const admin = createAdminClient();
  await admin.from("users").update({ status: "rejected" }).eq("id", userId);
  await admin.from("student_profiles").update({ rejection_reason: reason }).eq("user_id", userId);
  revalidatePath("/director/students");
  return { success: true };
}
