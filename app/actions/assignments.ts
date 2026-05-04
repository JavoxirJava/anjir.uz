"use server";

import { getCurrentUser } from "@/lib/api/auth";
import { createAssignment, deleteAssignment, submitAssignment, gradeSubmission } from "@/lib/api/assignments";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const assignmentSchema = z.object({
  title:            z.string().min(3, "Sarlavha kamida 3 ta belgi"),
  description:      z.string().optional(),
  deadline:         z.string().optional(),
  subject_id:       z.string().min(1, "Fan tanlanishi shart"),
  classIds:         z.array(z.string()).min(1, "Kamida 1 ta sinf tanlang"),
  difficulty_level: z.enum(["low", "medium", "high"]).default("medium"),
  is_for_disabled:  z.boolean().default(false),
});

export async function createAssignmentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const raw = {
    title:            formData.get("title"),
    description:      formData.get("description") || undefined,
    deadline:         formData.get("deadline")    || undefined,
    subject_id:       formData.get("subject_id")  || "",
    classIds:         formData.getAll("classIds"),
    difficulty_level: formData.get("difficulty_level") || "medium",
    is_for_disabled:  formData.get("is_for_disabled") === "true",
  };

  const parsed = assignmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const id = await createAssignment({
      title:            parsed.data.title,
      description:      parsed.data.description ?? null,
      deadline:         parsed.data.deadline    ?? null,
      teacher_id:       user.id,
      subject_id:       parsed.data.subject_id,
      classIds:         parsed.data.classIds,
      difficulty_level: parsed.data.difficulty_level,
      is_for_disabled:  parsed.data.is_for_disabled,
    });
    revalidatePath("/teacher/assignments");
    return { id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Vazifa yaratishda xatolik" };
  }
}

export async function deleteAssignmentAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  try {
    await deleteAssignment(id);
    revalidatePath("/teacher/assignments");
    return { success: true };
  } catch {
    return { error: "Vazifani o'chirishda xatolik" };
  }
}

export async function submitAssignmentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const assignment_id = formData.get("assignment_id") as string;
  const text     = (formData.get("text")     as string) || null;
  const file_url = (formData.get("file_url") as string) || null;

  if (!assignment_id) return { error: "Vazifa ID kiritilmadi" };
  if (!text && !file_url) return { error: "Matn yoki fayl kiritilishi shart" };

  try {
    const id = await submitAssignment({ assignment_id, student_id: user.id, text, file_url });
    revalidatePath(`/app/assignments/${assignment_id}`);
    return { id };
  } catch {
    return { error: "Topshiriq yuborishda xatolik" };
  }
}

export async function gradeSubmissionAction(
  submissionId: string,
  grade: number,
  comment: string | null,
  assignmentId: string
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  if (grade < 0 || grade > 100) return { error: "Ball 0–100 oralig'ida bo'lishi kerak" };

  try {
    await gradeSubmission(submissionId, grade, comment);
    revalidatePath(`/teacher/assignments/${assignmentId}/submissions`);
    return { success: true };
  } catch {
    return { error: "Baholashda xatolik" };
  }
}
