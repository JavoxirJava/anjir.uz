import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { AddSchoolForm } from "./AddSchoolForm";
import { SchoolActions } from "./SchoolActions";

export const metadata: Metadata = {
  title: `${uz.admin.schools} — Anjir.uz`,
};

export default async function AdminSchoolsPage() {
  const supabase = await createClient();

  const { data: schools } = await supabase
    .from("schools")
    .select("id, name, address, director_id, users(first_name, last_name)")
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.admin.schools}</h1>

      <AddSchoolForm />

      {(schools ?? []).length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : (
        <ul className="space-y-2" role="list">
          {(schools ?? []).map((s: unknown) => {
            const school = s as { id: string; name: string; address: string | null; users?: { first_name: string; last_name: string } | null };
            const director = Array.isArray(school.users) ? school.users[0] : school.users;
            return (
              <li key={school.id}>
                <Card>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{school.name}</p>
                        {school.address && <p className="text-sm text-muted-foreground">{school.address}</p>}
                        {director && (
                          <p className="text-xs text-muted-foreground">
                            Direktor: {director.first_name} {director.last_name}
                          </p>
                        )}
                      </div>
                      <SchoolActions school={{ id: school.id, name: school.name, address: school.address }} />
                    </div>
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
