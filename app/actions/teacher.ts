"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().min(1, "Ism kiritilishi shart").max(50),
  lastName:  z.string().min(1, "Familiya kiritilishi shart").max(50),
});

const passwordSchema = z.object({
  password: z.string().min(8, "Parol kamida 8 ta belgi"),
});

export async function updateTeacherProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const parsed = profileSchema.safeParse({
    firstName: (formData.get("firstName") as string) || "",
    lastName:  (formData.get("lastName")  as string) || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("users")
    .update({
      first_name: parsed.data.firstName,
      last_name:  parsed.data.lastName,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/teacher/settings");
  return { success: true };
}

export async function addTeacherAssignmentAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const schoolId  = (formData.get("schoolId")  as string) || "";
  const subjectId = (formData.get("subjectId") as string) || "";
  const classIds  = formData.getAll("classIds") as string[];

  if (!schoolId)   return { error: "Maktab tanlanishi shart" };
  if (!subjectId)  return { error: "Fan tanlanishi shart" };
  if (classIds.length === 0) return { error: "Kamida bitta sinf tanlang" };

  const admin = createAdminClient();

  // Shu maktab + fan uchun eski assignment'larni o'chirish
  await admin
    .from("teacher_assignments")
    .delete()
    .eq("teacher_id", user.id)
    .eq("school_id", schoolId)
    .eq("subject_id", subjectId);

  // Yangilarini qo'shish
  const rows = classIds.map((classId) => ({
    teacher_id: user.id,
    school_id:  schoolId,
    class_id:   classId,
    subject_id: subjectId,
  }));

  const { error } = await admin.from("teacher_assignments").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/teacher/settings");
  return { success: true };
}

export async function removeTeacherSchoolAction(schoolId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("teacher_assignments")
    .delete()
    .eq("teacher_id", user.id)
    .eq("school_id", schoolId);

  if (error) return { error: error.message };

  revalidatePath("/teacher/settings");
  return { success: true };
}

export async function approveStudentAction(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const admin = createAdminClient();

  const { error: e1 } = await admin
    .from("student_profiles")
    .update({ approved_at: new Date().toISOString(), rejected_at: null, rejection_reason: null })
    .eq("user_id", userId);
  if (e1) return { error: e1.message };

  const { error: e2 } = await admin
    .from("users")
    .update({ status: "active" })
    .eq("id", userId);
  if (e2) return { error: e2.message };

  revalidatePath("/teacher/students");
  return { success: true };
}

export async function rejectStudentAction(userId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const admin = createAdminClient();

  const { error: e1 } = await admin
    .from("student_profiles")
    .update({ rejection_reason: reason.trim(), approved_at: null })
    .eq("user_id", userId);
  if (e1) return { error: e1.message };

  const { error: e2 } = await admin
    .from("users")
    .update({ status: "rejected" })
    .eq("id", userId);
  if (e2) return { error: e2.message };

  revalidatePath("/teacher/students");
  return { success: true };
}

export async function updateTeacherPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const parsed = passwordSchema.safeParse({
    password: (formData.get("password") as string) || "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password: parsed.data.password,
  });

  if (error) return { error: error.message };
  return { success: true };
}
