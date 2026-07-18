"use server";

import { getCurrentUser } from "@/lib/api/auth";
import { createAssignment, deleteAssignment, submitAssignment, gradeSubmission, updateAssignmentProgress, reviewAssignmentProgress, updateAssignmentSubject } from "@/lib/api/assignments";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const assignmentSchema = z.object({
  title:            z.string().min(3, "Sarlavha kamida 3 ta belgi"),
  description:      z.string().optional(),
  file_url:         z.string().url().optional(),
  link:             z.string().url("Havola noto'g'ri formatda").optional().or(z.literal("")),
  deadline:         z.string().optional(),
  topic_id:         z.string().optional(),
  classIds:         z.array(z.string()).min(1, "Kamida 1 ta sinf tanlang"),
  is_for_disabled:  z.boolean().default(false),
});

export async function createAssignmentAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  const raw = {
    title:            formData.get("title"),
    description:      formData.get("description") || undefined,
    file_url:         formData.get("file_url") || undefined,
    link:             formData.get("link") || undefined,
    deadline:         formData.get("deadline")    || undefined,
    topic_id:         formData.get("topic_id") || undefined,
    classIds:         formData.getAll("classIds"),
    is_for_disabled:  formData.get("is_for_disabled") === "true",
  };

  const parsed = assignmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const id = await createAssignment({
      title:            parsed.data.title,
      description:      parsed.data.description ?? null,
      file_url:         parsed.data.file_url ?? null,
      link:             parsed.data.link || null,
      deadline:         parsed.data.deadline    ?? null,
      teacher_id:       user.id,
      topic_id:         parsed.data.topic_id ?? null,
      classIds:         parsed.data.classIds,
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

export async function updateAssignmentProgressAction(
  assignmentId: string,
  action: "done" | "cannot_do"
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  try {
    await updateAssignmentProgress(assignmentId, action);
    revalidatePath("/app/assignments");
    revalidatePath(`/app/assignments/${assignmentId}`);
    return { success: true };
  } catch {
    return { error: "Topshiriq holatini yangilashda xatolik" };
  }
}

export async function reviewAssignmentProgressAction(
  submissionId: string,
  assignmentId: string,
  decision: "approve" | "reject"
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };

  try {
    await reviewAssignmentProgress(submissionId, decision);
    revalidatePath(`/teacher/assignments/${assignmentId}/submissions`);
    return { success: true };
  } catch {
    return { error: "Tasdiqlashda xatolik" };
  }
}

export async function updateAssignmentSubjectAction(assignmentId: string, topicId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Tizimga kiring" };
  if (!topicId) return { error: "Mavzu tanlanishi shart" };

  try {
    await updateAssignmentSubject(assignmentId, topicId);
    revalidatePath("/teacher/assignments");
    revalidatePath("/app/assignments");
    return { success: true };
  } catch {
    return { error: "Mavzuni yangilashda xatolik" };
  }
}
