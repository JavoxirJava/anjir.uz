import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
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
  first_name: string;
  last_name: string;
  class_id: string;
  approved_at: string | null;
  rejection_reason: string | null;
  grade: number | null;
  letter: string | null;
}

function StudentCard({ student }: { student: StudentRow }) {
  const name = `${student.first_name} ${student.last_name}`.trim() || "Noma'lum";
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
  const user = await getCurrentUser();
  if (!user) return <p className="p-6 text-muted-foreground">Tizimga kiring.</p>;

  const rows = await apiGet<StudentRow[]>(`/teachers/${user.id}/class-students`).catch(() => null);

  if (rows === null) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{uz.teacher.myStudents}</h1>
        <p className="text-destructive text-sm">Ma'lumotlarni yuklashda xato yuz berdi.</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{uz.teacher.myStudents}</h1>
        <p className="text-muted-foreground">Sizga hali sinf biriktirilmagan.</p>
      </div>
    );
  }

  const pending  = rows.filter((s) => !s.approved_at && !s.rejection_reason);
  const approved = rows.filter((s) => !!s.approved_at);
  const rejected = rows.filter((s) => !!s.rejection_reason && !s.approved_at);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{uz.teacher.myStudents}</h1>

      {pending.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            {uz.teacher.pendingStudents}
            <Badge variant="destructive">{pending.length}</Badge>
          </h2>
          <ul className="space-y-2">
            {pending.map((s) => <li key={s.user_id}><StudentCard student={s} /></li>)}
          </ul>
        </section>
      )}

      {approved.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Tasdiqlangan o&apos;quvchilar ({approved.length})
          </h2>
          <ul className="space-y-2">
            {approved.map((s) => <li key={s.user_id}><StudentCard student={s} /></li>)}
          </ul>
        </section>
      )}

      {rejected.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Rad etilganlar ({rejected.length})
          </h2>
          <ul className="space-y-2">
            {rejected.map((s) => <li key={s.user_id}><StudentCard student={s} /></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
