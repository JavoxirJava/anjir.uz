import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `${uz.director.teachers} — Anjir.uz`,
};

export default async function DirectorTeachersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: school } = await supabase
    .from("schools")
    .select("id")
    .eq("director_id", user!.id)
    .single();

  const schoolId = (school as { id: string } | null)?.id;

  // Teacher assignments (sinf va fan birikmalar)
  const { data: teachers } = await supabase
    .from("users")
    .select("id, first_name, last_name, status, created_at")
    .eq("role", "teacher")
    .order("first_name");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.director.teachers}</h1>
      {(teachers ?? []).length === 0 ? (
        <p className="text-muted-foreground">{uz.common.noData}</p>
      ) : (
        <ul className="space-y-2" role="list">
          {(teachers ?? []).map((t: { id: string; first_name: string; last_name: string; status: string }) => (
            <li key={t.id}>
              <Card>
                <CardContent className="flex items-center justify-between pt-3 pb-3">
                  <p className="font-medium">{t.first_name} {t.last_name}</p>
                  <Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
