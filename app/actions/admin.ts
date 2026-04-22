"use server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const phoneRegex = /^\+998[0-9]{9}$/;

const directorSchema = z.object({
  firstName: z.string().min(1, "Ism kiritilishi shart").max(50),
  lastName:  z.string().min(1, "Familiya kiritilishi shart").max(50),
  phone:     z.string().regex(phoneRegex, "Telefon: +998XXXXXXXXX formatida"),
  password:  z.string().min(8, "Parol kamida 8 ta belgi"),
  schoolId:  z.string().optional().default(""),
});

export async function createDirectorAction(formData: FormData) {
  const raw = {
    firstName: (formData.get("firstName") as string) || "",
    lastName:  (formData.get("lastName")  as string) || "",
    phone:     (formData.get("phone")     as string) || "",
    password:  (formData.get("password")  as string) || "",
    schoolId:  (formData.get("schoolId")  as string) || "",
  };

  const parsed = directorSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const admin = createAdminClient();

  // 1. auth.users da yaratish
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: `${parsed.data.phone}@anjir.internal`,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    if (authError?.message.includes("already registered")) {
      return { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" };
    }
    return { error: authError?.message ?? "Xatolik yuz berdi" };
  }

  const userId = authData.user.id;

  // 2. public.users ga yozish — status: active (admin yaratadi)
  const { error: userError } = await admin.from("users").insert({
    id: userId,
    phone: parsed.data.phone,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    role: "director",
    status: "active",
  });

  if (userError) {
    if (userError.code === "23505") return { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" };
    return { error: userError.message };
  }

  // 3. Maktabga direktor sifatida biriktirish
  if (parsed.data.schoolId) {
    await admin
      .from("schools")
      .update({ director_id: userId })
      .eq("id", parsed.data.schoolId);
  }

  revalidatePath("/admin/directors");
  return { success: true };
}

// =============================================================
// SUBJECTS (fanlar)
// =============================================================

export async function addSubjectAction(name: string) {
  if (!name.trim()) return { error: "Fan nomi kiritilishi shart" };
  const admin = createAdminClient();
  const { error } = await admin.from("subjects").insert({ name: name.trim() });
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function updateSubjectAction(id: string, name: string) {
  if (!name.trim()) return { error: "Fan nomi bo'sh bo'lishi mumkin emas" };
  const admin = createAdminClient();
  const { error } = await admin.from("subjects").update({ name: name.trim() }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function deleteSubjectAction(id: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("subjects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  return { success: true };
}

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
