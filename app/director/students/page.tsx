import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentActions } from "./StudentActions";

export const metadata: Metadata = {
  title: `${uz.director.students} — I-Imkon.uz`,
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

type StudentRow = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
  class_id: string;
  grade: number | null;
  letter: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
};

export default async function DirectorStudentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const school = await apiGet<{ id: string } | null>("/schools/my").catch(() => null);
  const students = school
    ? await apiGet<StudentRow[]>(`/schools/${school.id}/students`).catch(() => [])
    : [];

  const pendingStudents = students.filter((s) => s.status === "pending");
  const otherStudents = students.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{uz.director.students}</h1>
        <p className="text-sm text-muted-foreground mt-1">{students.length} ta o&apos;quvchi</p>
      </div>

      {pendingStudents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-700">Kutilayotgan o&apos;quvchilar ({pendingStudents.length})</h2>
          <ul className="space-y-2" role="list" aria-label="Kutilayotgan o'quvchilar">
            {pendingStudents.map((s) => (
              <li key={s.id}>
                <Card className="border-yellow-200">
                  <CardContent className="flex items-center justify-between gap-4 pt-3 pb-3">
                    <div>
                      <p className="font-medium">{s.first_name} {s.last_name}</p>
                      {s.grade && (
                        <p className="text-xs text-muted-foreground">{s.grade}-sinf {s.letter}</p>
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
            ))}
          </ul>
        </div>
      )}

      {students.length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : otherStudents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Barcha o&apos;quvchilar</h2>
          <ul className="space-y-2" role="list" aria-label={uz.director.students}>
            {otherStudents.map((s) => (
              <li key={s.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-4 pt-3 pb-3">
                    <div>
                      <p className="font-medium">{s.first_name} {s.last_name}</p>
                      {s.grade && (
                        <p className="text-xs text-muted-foreground">{s.grade}-sinf {s.letter}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {s.approved_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(s.approved_at).toLocaleDateString("uz-UZ")}
                        </span>
                      )}
                      <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>
                        {STATUS_LABELS[s.status] ?? s.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
