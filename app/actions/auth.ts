"use server";

import { redirect } from "next/navigation";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { setAuthCookies, clearAuthCookies } from "@/lib/api/auth";
import { API_URL } from "@/lib/api/config";
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

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: parsed.data.phone, password: parsed.data.password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    return { error: body.error ?? uz.auth.loginError };
  }

  const data = await res.json() as {
    access_token: string;
    refresh_token: string;
    user: { role: string; status: string };
  };

  await setAuthCookies(data.access_token, data.refresh_token);

  if (data.user.status === "pending" || data.user.status === "rejected") {
    redirect("/pending");
  }

  switch (data.user.role) {
    case "super_admin": redirect("/admin");
    case "director":    redirect("/director");
    case "teacher":     redirect("/teacher");
    case "parent":      redirect("/parent");
    default:            redirect("/app");
  }
}

export async function registerAction(formData: FormData) {
  const teacherClassIds = formData.getAll("teacherClassIds") as string[];

  const raw = {
    firstName:       (formData.get("firstName") as string) || "",
    lastName:        (formData.get("lastName") as string) || "",
    phone:           (formData.get("phone") as string) || "",
    password:        (formData.get("password") as string) || "",
    role:            (formData.get("role") as string) || "student",
    schoolId:        (formData.get("schoolId") as string) || "",
    classId:         (formData.get("classId") as string) || "",
    teacherSchoolId: (formData.get("teacherSchoolId") as string) || "",
    teacherClassIds,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone:      parsed.data.phone,
      password:   parsed.data.password,
      first_name: parsed.data.firstName,
      last_name:  parsed.data.lastName,
      role:       parsed.data.role,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    return { error: body.error ?? uz.common.error };
  }

  const data = await res.json() as { access_token: string; refresh_token: string; user: { id: string } };
  await setAuthCookies(data.access_token, data.refresh_token);

  const userId = data.user.id;
  const token  = data.access_token;

  // Profile setup after registration
  if (parsed.data.role === "teacher") {
    if (parsed.data.teacherSchoolId && parsed.data.teacherClassIds?.length) {
      // teacher_assignments via backend — would need a dedicated endpoint,
      // for now done via admin API
      await fetch(`${API_URL}/teachers/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          teacher_id: userId,
          school_id:  parsed.data.teacherSchoolId,
          class_ids:  parsed.data.teacherClassIds,
        }),
      });
    }
  } else if (parsed.data.role === "student") {
    if (parsed.data.schoolId && parsed.data.classId) {
      await fetch(`${API_URL}/students/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          school_id: parsed.data.schoolId,
          class_id:  parsed.data.classId,
        }),
      });
    }
  }

  if (parsed.data.role === "parent") redirect("/parent/link");
  redirect("/onboarding");
}

export async function logoutAction() {
  await clearAuthCookies();
  redirect("/login");
}
