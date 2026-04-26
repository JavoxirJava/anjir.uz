import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { AddSchoolForm } from "./AddSchoolForm";
import { SchoolActions } from "./SchoolActions";

export const metadata: Metadata = {
  title: `${uz.admin.schools} — I-Imkon.uz`,
};

export default async function AdminSchoolsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const schools = await apiGet<{
    id: string; name: string; address: string | null;
    director_first: string | null; director_last: string | null;
  }[]>("/schools").catch(() => []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.admin.schools}</h1>

      <AddSchoolForm />

      {schools.length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : (
        <ul className="space-y-2" role="list">
          {schools.map((s) => (
            <li key={s.id}>
              <Card>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      {s.address && <p className="text-sm text-muted-foreground">{s.address}</p>}
                      {s.director_first && (
                        <p className="text-xs text-muted-foreground">
                          Direktor: {s.director_first} {s.director_last}
                        </p>
                      )}
                    </div>
                    <SchoolActions school={{ id: s.id, name: s.name, address: s.address }} />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
