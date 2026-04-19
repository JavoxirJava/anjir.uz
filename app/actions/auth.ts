"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    schoolId: formData.get("schoolId") as string,
    classId: formData.get("classId") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Supabase Auth orqali yaratish (email = phone@anjir.internal)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: `${parsed.data.phone}@anjir.internal`,
    password: parsed.data.password,
  });

  if (authError || !authData.user) {
    if (authError?.message.includes("already registered")) {
      return { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" };
    }
    return { error: uz.common.error };
  }

  const userId = authData.user.id;

  // users jadvaliga yozish
  const { error: userError } = await supabase.from("users").insert({
    id: userId,
    phone: parsed.data.phone,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    role: "student",
    status: "pending",
  });

  if (userError) {
    return { error: uz.common.error };
  }

  // student_profiles ga yozish
  await supabase.from("student_profiles").insert({
    user_id: userId,
    school_id: parsed.data.schoolId,
    class_id: parsed.data.classId,
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
  });

  redirect("/pending");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
