import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { AddClassForm } from "./AddClassForm";

export const metadata: Metadata = {
  title: `${uz.director.classes} — I-Imkon.uz`,
};

export default async function DirectorClassesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const school = await apiGet<{ id: string; name: string } | null>("/schools/my").catch(() => null);
  const classes = school
    ? await apiGet<{ id: string; grade: number; letter: string }[]>(`/schools/${school.id}/classes`).catch(() => [])
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.director.classes}</h1>
      {school && <AddClassForm schoolId={school.id} />}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="list">
        {classes.map((cls) => (
          <Card key={cls.id} role="listitem">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold">{cls.grade}{cls.letter}</p>
              <p className="text-xs text-muted-foreground mt-1">{uz.school.className}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
