"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  classId: z.string().uuid("Noto'g'ri sinf tanlandi"),
});

export async function updateStudentClassAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tizimga kiring" };

  const parsed = schema.safeParse({ classId: formData.get("classId") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const admin = createAdminClient();

  // Sinfdan school_id ni olish
  const { data: classRow, error: classError } = await admin
    .from("classes")
    .select("school_id")
    .eq("id", parsed.data.classId)
    .single();

  if (classError || !classRow) return { error: "Sinf topilmadi" };

  // Mavjud profilni upsert — tasdiqlash ma'lumotlarini tozalash
  const { error: profileError } = await admin
    .from("student_profiles")
    .upsert(
      {
        user_id: user.id,
        class_id: parsed.data.classId,
        school_id: classRow.school_id,
        approved_by: null,
        approved_at: null,
        rejection_reason: null,
      },
      { onConflict: "user_id" }
    );

  if (profileError) return { error: profileError.message };

  // Statusni "pending"ga qaytarish — direktor qayta tasdiqlaydi
  const { error: statusError } = await admin
    .from("users")
    .update({ status: "pending" })
    .eq("id", user.id);

  if (statusError) return { error: statusError.message };

  redirect("/pending");
}
