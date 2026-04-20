import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uz } from "@/lib/strings/uz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StudentActionButtons } from "./StudentActionButtons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.teacher.myStudents} — Anjir.uz`,
};

interface StudentRow {
  user_id: string;
  class_id: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  users?: {
    first_name: string;
    last_name: string;
    status: string;
  } | null;
  classes?: {
    grade: number;
    letter: string;
  } | null;
}

export default async function TeacherStudentsPage() {
  // Auth uchun oddiy client, ma'lumotlar uchun admin client (RLS bypass)
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  const supabase = createAdminClient();

  // Mening sinf ID'larim
  const { data: assignments } = await supabase
    .from("teacher_assignments")
    .select("class_id")
    .eq("teacher_id", user!.id);

  const classIds = [...new Set((assignments ?? []).map((a: { class_id: string }) => a.class_id))];

  if (classIds.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{uz.teacher.myStudents}</h1>
        <p className="text-muted-foreground">Sizga sinf biriktirilmagan.</p>
      </div>
    );
  }

  const { data: students } = await supabase
    .from("student_profiles")
    .select("user_id, class_id, approved_at, rejected_at, rejection_reason, users(first_name, last_name, status), classes(grade, letter)")
    .in("class_id", classIds)
    .order("class_id");

  const rows = (students ?? []) as unknown as StudentRow[];

  const pending   = rows.filter((s) => !s.approved_at && !s.rejected_at);
  const approved  = rows.filter((s) => !!s.approved_at);
  const rejected  = rows.filter((s) => !!s.rejected_at);

  function StudentCard({ student }: { student: StudentRow }) {
    const u = Array.isArray(student.users) ? student.users[0] : student.users;
    const cls = Array.isArray(student.classes) ? student.classes[0] : student.classes;
    const name = u ? `${u.first_name} ${u.last_name}` : "Noma'lum";
    return (
      <Card>
        <CardContent className="flex items-center justify-between gap-3 pt-3 pb-3">
          <div>
            <p className="font-medium">{name}</p>
            {cls && (
              <p className="text-xs text-muted-foreground">{cls.grade}{cls.letter}-sinf</p>
            )}
          </div>
          <StudentActionButtons
            userId={student.user_id}
            approved={!!student.approved_at}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{uz.teacher.myStudents}</h1>

      {/* Kutilayotganlar */}
      {pending.length > 0 && (
        <section aria-labelledby="pending-heading">
          <h2 id="pending-heading" className="text-lg font-semibold mb-3 flex items-center gap-2">
            {uz.teacher.pendingStudents}
            <Badge variant="destructive">{pending.length}</Badge>
          </h2>
          <ul className="space-y-2" role="list">
            {pending.map((s) => (
              <li key={s.user_id}><StudentCard student={s} /></li>
            ))}
          </ul>
        </section>
      )}

      {/* Tasdiqlangan */}
      {approved.length > 0 && (
        <section aria-labelledby="approved-heading">
          <h2 id="approved-heading" className="text-lg font-semibold mb-3">
            Tasdiqlangan o&apos;quvchilar ({approved.length})
          </h2>
          <ul className="space-y-2" role="list">
            {approved.map((s) => (
              <li key={s.user_id}><StudentCard student={s} /></li>
            ))}
          </ul>
        </section>
      )}

      {/* Rad etilganlar */}
      {rejected.length > 0 && (
        <section aria-labelledby="rejected-heading">
          <h2 id="rejected-heading" className="text-lg font-semibold mb-3">
            Rad etilganlar ({rejected.length})
          </h2>
          <ul className="space-y-2" role="list">
            {rejected.map((s) => (
              <li key={s.user_id}><StudentCard student={s} /></li>
            ))}
          </ul>
        </section>
      )}

      {rows.length === 0 && (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      )}
    </div>
  );
}
