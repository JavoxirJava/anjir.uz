import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentActions } from "./StudentActions";

export const metadata: Metadata = {
  title: `${uz.director.students} — Anjir.uz`,
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  pending: "secondary",
  rejected: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Faol",
  pending: "Kutilmoqda",
  rejected: "Rad etilgan",
};

export default async function DirectorStudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: school } = await supabase
    .from("schools")
    .select("id")
    .eq("director_id", user!.id)
    .single();

  const schoolId = (school as { id: string } | null)?.id;

  // Shu maktabdagi barcha sinflar
  const { data: classes } = await supabase
    .from("classes")
    .select("id, grade, letter")
    .eq("school_id", schoolId ?? "")
    .order("grade")
    .order("letter");

  const classIds = (classes ?? []).map((c: { id: string }) => c.id);

  // Student profillarini sinflar orqali topish
  const { data: studentProfiles } = classIds.length > 0
    ? await supabase
        .from("student_profiles")
        .select("user_id, class_id, approved_at, rejected_at, rejection_reason")
        .in("class_id", classIds)
        .order("class_id")
    : { data: [] };

  const userIds = (studentProfiles ?? []).map((sp: { user_id: string }) => sp.user_id);

  const { data: students } = userIds.length > 0
    ? await supabase
        .from("users")
        .select("id, first_name, last_name, status, created_at")
        .in("id", userIds)
        .order("first_name")
    : { data: [] };

  // Map class info to student
  const classMap = Object.fromEntries(
    (classes ?? []).map((c: { id: string; grade: number; letter: string }) => [c.id, c])
  );
  const profileMap = Object.fromEntries(
    (studentProfiles ?? []).map((sp: { user_id: string; class_id: string; approved_at: string | null; rejected_at: string | null }) => [
      sp.user_id,
      sp,
    ])
  );

  type Student = { id: string; first_name: string; last_name: string; status: string; created_at: string };
  type ClassInfo = { id: string; grade: number; letter: string };

  const pendingStudents = (students as Student[] ?? []).filter((s) => s.status === "pending");
  const otherStudents = (students as Student[] ?? []).filter((s) => s.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{uz.director.students}</h1>
        <p className="text-sm text-muted-foreground mt-1">{(students ?? []).length} ta o'quvchi</p>
      </div>

      {pendingStudents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-700">Kutilayotgan o'quvchilar ({pendingStudents.length})</h2>
          <ul className="space-y-2" role="list" aria-label="Kutilayotgan o'quvchilar">
            {pendingStudents.map((s) => {
              const profile = profileMap[s.id];
              const cls = profile ? classMap[profile.class_id] as ClassInfo | undefined : undefined;
              return (
                <li key={s.id}>
                  <Card className="border-yellow-200">
                    <CardContent className="flex items-center justify-between gap-4 pt-3 pb-3">
                      <div>
                        <p className="font-medium">{s.first_name} {s.last_name}</p>
                        {cls && (
                          <p className="text-xs text-muted-foreground">{cls.grade}-sinf {cls.letter}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.created_at).toLocaleDateString("uz-UZ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </Badge>
                        <StudentActions userId={s.id} status={s.status} />
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {(students ?? []).length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : otherStudents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Barcha o'quvchilar</h2>
          <ul className="space-y-2" role="list" aria-label={uz.director.students}>
            {otherStudents.map((s) => {
              const profile = profileMap[s.id];
              const cls = profile ? classMap[profile.class_id] as ClassInfo | undefined : undefined;
              return (
                <li key={s.id}>
                  <Card>
                    <CardContent className="flex items-center justify-between gap-4 pt-3 pb-3">
                      <div>
                        <p className="font-medium">{s.first_name} {s.last_name}</p>
                        {cls && (
                          <p className="text-xs text-muted-foreground">{cls.grade}-sinf {cls.letter}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {profile?.approved_at && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(profile.approved_at).toLocaleDateString("uz-UZ")}
                          </span>
                        )}
                        <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
