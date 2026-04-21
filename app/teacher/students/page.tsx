import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StudentActionButtons } from "./StudentActionButtons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "O'quvchilarim — I-Imkon.uz",
};

interface StudentRow {
  user_id: string;
  class_id: string;
  approved_at: string | null;
  rejection_reason: string | null;
  firstName: string;
  lastName: string;
  grade: number | null;
  letter: string | null;
}

function StudentCard({ student }: { student: StudentRow }) {
  const name = `${student.firstName} ${student.lastName}`.trim() || "Noma'lum";
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 py-3">
        <div>
          <p className="font-medium">{name}</p>
          {student.grade != null && (
            <p className="text-xs text-muted-foreground">
              {student.grade}{student.letter}-sinf
            </p>
          )}
        </div>
        <StudentActionButtons
          userId={student.user_id}
          approved={!!student.approved_at}
          rejected={!!student.rejection_reason}
        />
      </CardContent>
    </Card>
  );
}

export default async function TeacherStudentsPage() {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
      return <p className="p-6 text-muted-foreground">Tizimga kiring.</p>;
    }

    const supabase = createAdminClient();

    // 1. Teacher'ning sinf ID'lari
    const { data: assignments, error: aErr } = await supabase
      .from("teacher_assignments")
      .select("class_id")
      .eq("teacher_id", user.id);

    if (aErr) throw new Error("teacher_assignments: " + aErr.message);

    const classIds = [...new Set((assignments ?? []).map((a: { class_id: string }) => a.class_id))];

    if (classIds.length === 0) {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{uz.teacher.myStudents}</h1>
          <p className="text-muted-foreground">Sizga hali sinf biriktirilmagan.</p>
        </div>
      );
    }

    // 2. student_profiles
    const { data: profiles, error: pErr } = await supabase
      .from("student_profiles")
      .select("user_id, class_id, approved_at, rejection_reason")
      .in("class_id", classIds)
      .order("class_id");

    if (pErr) throw new Error("student_profiles: " + pErr.message);

    const profileList = profiles ?? [];

    // 3. Users alohida
    const userIds = profileList.map((p: { user_id: string }) => p.user_id);
    const { data: usersData } = userIds.length > 0
      ? await supabase.from("users").select("id, first_name, last_name").in("id", userIds)
      : { data: [] };

    // 4. Classes alohida
    const { data: classesData } = await supabase
      .from("classes")
      .select("id, grade, letter")
      .in("id", classIds);

    // 5. Merge
    const userMap: Record<string, { first_name: string; last_name: string }> = {};
    for (const u of (usersData ?? [])) {
      userMap[(u as { id: string; first_name: string; last_name: string }).id] = u as { first_name: string; last_name: string };
    }

    const classMap: Record<string, { grade: number; letter: string }> = {};
    for (const c of (classesData ?? [])) {
      classMap[(c as { id: string; grade: number; letter: string }).id] = c as { grade: number; letter: string };
    }

    const rows: StudentRow[] = profileList.map((p: {
      user_id: string; class_id: string;
      approved_at: string | null; rejection_reason: string | null;
    }) => ({
      user_id:          p.user_id,
      class_id:         p.class_id,
      approved_at:      p.approved_at,
      rejection_reason: p.rejection_reason,
      firstName:        userMap[p.user_id]?.first_name ?? "Noma'lum",
      lastName:         userMap[p.user_id]?.last_name  ?? "",
      grade:            classMap[p.class_id]?.grade  ?? null,
      letter:           classMap[p.class_id]?.letter ?? null,
    }));

    const pending  = rows.filter((s) => !s.approved_at && !s.rejection_reason);
    const approved = rows.filter((s) => !!s.approved_at);
    const rejected = rows.filter((s) => !!s.rejection_reason && !s.approved_at);

    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">{uz.teacher.myStudents}</h1>

        {rows.length === 0 && (
          <p className="text-muted-foreground">{uz.common.noData}</p>
        )}

        {/* Kutilayotganlar */}
        {pending.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              {uz.teacher.pendingStudents}
              <Badge variant="destructive">{pending.length}</Badge>
            </h2>
            <ul className="space-y-2">
              {pending.map((s) => (
                <li key={s.user_id}><StudentCard student={s} /></li>
              ))}
            </ul>
          </section>
        )}

        {/* Tasdiqlangan */}
        {approved.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">
              Tasdiqlangan o&apos;quvchilar ({approved.length})
            </h2>
            <ul className="space-y-2">
              {approved.map((s) => (
                <li key={s.user_id}><StudentCard student={s} /></li>
              ))}
            </ul>
          </section>
        )}

        {/* Rad etilganlar */}
        {rejected.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">
              Rad etilganlar ({rejected.length})
            </h2>
            <ul className="space-y-2">
              {rejected.map((s) => (
                <li key={s.user_id}><StudentCard student={s} /></li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : JSON.stringify(err);
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{uz.teacher.myStudents}</h1>
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive font-mono break-all">
          {msg}
        </div>
      </div>
    );
  }
}
