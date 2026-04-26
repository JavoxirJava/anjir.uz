import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeacherProfileEditForm } from "./TeacherProfileEditForm";
import { TeacherSchoolForm } from "./TeacherSchoolForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sozlamalar — I-Imkon.uz",
};

interface AssignedSchool {
  id: string;
  name: string;
  address: string | null;
  classes: { grade: number; letter: string }[];
}

export default async function TeacherSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [assignedSchools, allSchools, allSubjects] = await Promise.all([
    apiGet<AssignedSchool[]>(`/teachers/${user.id}/school-assignments`).catch(() => []),
    apiGet<{ id: string; name: string }[]>("/schools").catch(() => []),
    apiGet<{ id: string; name: string }[]>("/subjects").catch(() => []),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Sozlamalar</h1>
        <p className="text-sm text-muted-foreground mt-1">Profil va maktab ma&apos;lumotlari</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span aria-hidden="true">👤</span> Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">Ism</p>
              <p className="font-medium">{user.first_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">Familiya</p>
              <p className="font-medium">{user.last_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">Holat</p>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status === "active" ? "Faol" : user.status}
              </Badge>
            </div>
          </div>
          <TeacherProfileEditForm
            firstName={user.first_name ?? ""}
            lastName={user.last_name ?? ""}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span aria-hidden="true">🏫</span> Maktab va sinflar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherSchoolForm
            schools={allSchools}
            subjects={allSubjects}
            assigned={assignedSchools}
          />
        </CardContent>
      </Card>
    </div>
  );
}
