import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `${uz.director.teachers} — I-Imkon.uz`,
};

type TeacherRow = {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
  classes: { grade: number; letter: string }[];
};

export default async function DirectorTeachersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const school = await apiGet<{ id: string } | null>("/schools/my").catch(() => null);
  const teachers = school
    ? await apiGet<TeacherRow[]>(`/schools/${school.id}/teachers`).catch(() => [])
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{uz.director.teachers}</h1>
        <p className="text-sm text-muted-foreground mt-1">{teachers.length} ta o&apos;qituvchi</p>
      </div>
      {teachers.length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : (
        <ul className="space-y-2" role="list">
          {teachers.map((t) => {
            const classList = t.classes
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
