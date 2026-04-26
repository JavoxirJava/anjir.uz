"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { apiPost, apiPut, apiDelete } from "@/lib/api/server";

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

  try {
    await apiPost("/users", {
      first_name: parsed.data.firstName,
      last_name:  parsed.data.lastName,
      phone:      parsed.data.phone,
      password:   parsed.data.password,
      role:       "director",
      school_id:  parsed.data.schoolId || undefined,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Xatolik yuz berdi" };
  }

  revalidatePath("/admin/directors");
  return { success: true };
}

export async function addSubjectAction(name: string) {
  if (!name.trim()) return { error: "Fan nomi kiritilishi shart" };
  try {
    await apiPost("/subjects", { name: name.trim() });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Xatolik" };
  }
  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function updateSubjectAction(id: string, name: string) {
  if (!name.trim()) return { error: "Fan nomi bo'sh bo'lishi mumkin emas" };
  try {
    await apiPut(`/subjects/${id}`, { name: name.trim() });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Xatolik" };
  }
  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function deleteSubjectAction(id: string) {
  try {
    await apiDelete(`/subjects/${id}`);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Xatolik" };
  }
  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function approveUserAction(userId: string) {
  try {
    await apiPut(`/users/${userId}/status`, { status: "active" });
  } catch { /* ignore */ }
  revalidatePath("/admin/users");
  return { success: true };
}

export async function rejectUserAction(userId: string, reason?: string) {
  try {
    await apiPut(`/users/${userId}/status`, { status: "rejected", rejection_reason: reason });
  } catch { /* ignore */ }
  revalidatePath("/admin/users");
  return { success: true };
}
