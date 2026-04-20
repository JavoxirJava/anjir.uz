import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `${uz.director.teachers} — Anjir.uz`,
};

export default async function DirectorTeachersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: school } = await supabase
    .from("schools")
    .select("id")
    .eq("director_id", user!.id)
    .single();

  const schoolId = (school as { id: string } | null)?.id;

  // Shu maktabdagi o'qituvchilar — teacher_assignments orqali
  const { data: assignments } = schoolId
    ? await supabase
        .from("teacher_assignments")
        .select("teacher_id, class_id, classes(grade, letter)")
        .eq("school_id", schoolId)
    : { data: [] };

  const teacherIds = [...new Set((assignments ?? []).map((a: { teacher_id: string }) => a.teacher_id))];

  const { data: teachers } = teacherIds.length > 0
    ? await supabase
        .from("users")
        .select("id, first_name, last_name, status, created_at")
        .in("id", teacherIds)
        .order("first_name")
    : { data: [] };

  // O'qituvchi uchun sinflar mapping
  type AssignmentRow = { teacher_id: string; class_id: string; classes: { grade: number; letter: string }[] | null };
  const teacherClasses: Record<string, { grade: number; letter: string }[]> = {};
  for (const a of ((assignments ?? []) as unknown as AssignmentRow[])) {
    if (!teacherClasses[a.teacher_id]) teacherClasses[a.teacher_id] = [];
    const cls = Array.isArray(a.classes) ? a.classes[0] : a.classes;
    if (cls) teacherClasses[a.teacher_id].push(cls);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{uz.director.teachers}</h1>
        <p className="text-sm text-muted-foreground mt-1">{(teachers ?? []).length} ta o&apos;qituvchi</p>
      </div>
      {(teachers ?? []).length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : (
        <ul className="space-y-2" role="list">
          {(teachers ?? []).map((t: { id: string; first_name: string; last_name: string; status: string }) => {
            const classes = teacherClasses[t.id] ?? [];
            const classList = classes
              .sort((a, b) => a.grade - b.grade || a.letter.localeCompare(b.letter))
              .map((c) => `${c.grade}${c.letter}`)
              .join(", ");
            return (
              <li key={t.id}>
                <Card>
                  <CardContent className="flex items-center justify-between pt-3 pb-3">
                    <div>
                      <p className="font-medium">{t.first_name} {t.last_name}</p>
                      {classList && (
                        <p className="text-xs text-muted-foreground">Sinflar: {classList}</p>
                      )}
                    </div>
                    <Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
