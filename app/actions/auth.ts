"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { uz } from "@/lib/strings/uz";

export async function loginAction(formData: FormData) {
  const raw = {
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    rememberMe: formData.get("rememberMe") === "on",
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: `${parsed.data.phone}@anjir.internal`,
    password: parsed.data.password,
  });

  if (error) {
    return { error: uz.auth.loginError };
  }

  // Foydalanuvchi rolini aniqlash
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: uz.auth.loginError };

  const { data: userData } = await supabase
    .from("users")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!userData) return { error: uz.common.error };

  if (userData.status === "pending" || userData.status === "rejected") {
    redirect("/pending");
  }

  switch (userData.role) {
    case "super_admin":
      redirect("/admin");
    case "director":
      redirect("/director");
    case "teacher":
      redirect("/teacher");
    case "student":
      redirect("/app");
    default:
      redirect("/app");
  }
}

export async function registerAction(formData: FormData) {
  const teacherClassIds = formData.getAll("teacherClassIds") as string[];

  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    role: (formData.get("role") as string) || "student",
    schoolId: formData.get("schoolId") as string,
    classId: formData.get("classId") as string,
    teacherSchoolId: (formData.get("teacherSchoolId") as string) || "",
    teacherClassIds,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Admin client — RLS bypass, signUp + insert uchun
  const admin = createAdminClient();

  // auth.users da foydalanuvchi yaratish
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: `${parsed.data.phone}@anjir.internal`,
    password: parsed.data.password,
    email_confirm: true, // email tasdiqlash talab qilmasin
  });

  if (authError || !authData.user) {
    if (authError?.message.includes("already registered") || authError?.message.includes("already been registered")) {
      return { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" };
    }
    return { error: authError?.message ?? uz.common.error };
  }

  const userId = authData.user.id;

  // public.users ga yozish (admin client — RLS o'tkazib)
  const { error: userError } = await admin.from("users").insert({
    id: userId,
    phone: parsed.data.phone,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    role: parsed.data.role,
    status: "pending",
  });

  if (userError) {
    // Agar users allaqachon mavjud bo'lsa (duplicate)
    if (userError.code === "23505") {
      return { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" };
    }
    return { error: userError.message ?? uz.common.error };
  }

  if (parsed.data.role === "teacher") {
    // teacher_assignments — har bir classId uchun bir qator
    if (parsed.data.teacherSchoolId && parsed.data.teacherClassIds && parsed.data.teacherClassIds.length > 0) {
      const rows = parsed.data.teacherClassIds.map((classId) => ({
        teacher_id: userId,
        school_id: parsed.data.teacherSchoolId,
        class_id: classId,
      }));
      await admin.from("teacher_assignments").insert(rows);
    }
  } else {
    // student_profiles — faqat maktab tanlangan bo'lsa
    if (parsed.data.schoolId && parsed.data.classId) {
      await admin.from("student_profiles").insert({
        user_id: userId,
        school_id: parsed.data.schoolId,
        class_id: parsed.data.classId,
        approved_by: null,
        approved_at: null,
        rejection_reason: null,
      });
    }
  }

  // Sessiyani boshlash uchun oddiy client bilan login
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: `${parsed.data.phone}@anjir.internal`,
    password: parsed.data.password,
  });

  redirect("/pending");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
