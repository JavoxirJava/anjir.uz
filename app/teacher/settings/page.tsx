import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeacherProfileEditForm } from "./TeacherProfileEditForm";
import { TeacherSchoolForm } from "./TeacherSchoolForm";

export const metadata: Metadata = {
  title: "Sozlamalar — Anjir.uz",
};

export default async function TeacherSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("first_name, last_name, phone, status, created_at")
    .eq("id", user!.id)
    .single();

  // Qaysi maktab va sinflarga birikkan
  const { data: assignments } = await supabase
    .from("teacher_assignments")
    .select("school_id, class_id, schools(name, address), classes(grade, letter)")
    .eq("teacher_id", user!.id)
    .order("school_id");

  // Barcha maktablar va fanlar ro'yxati (admin — RLS bypass)
  const admin = createAdminClient();
  const [{ data: allSchools }, { data: allSubjects }] = await Promise.all([
    admin.from("schools").select("id, name").order("name"),
    admin.from("subjects").select("id, name").order("name"),
  ]);

  type Assignment = {
    school_id: string;
    class_id: string;
    schools: { name: string; address: string | null } | null;
    classes: { grade: number; letter: string } | null;
  };

  // Maktab bo'yicha guruhlash
  const schoolMap: Record<string, { name: string; address: string | null; classes: { grade: number; letter: string }[] }> = {};
  for (const a of ((assignments ?? []) as unknown as Assignment[])) {
    if (!schoolMap[a.school_id]) {
      schoolMap[a.school_id] = {
        name: a.schools?.name ?? "Noma'lum maktab",
        address: a.schools?.address ?? null,
        classes: [],
      };
    }
    if (a.classes) {
      schoolMap[a.school_id].classes.push(a.classes);
    }
  }

  const assignedSchools = Object.entries(schoolMap).map(([id, s]) => ({ id, ...s }));

  const u = userData as {
    first_name: string;
    last_name: string;
    phone: string;
    status: string;
    created_at: string;
  } | null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Sozlamalar</h1>
        <p className="text-sm text-muted-foreground mt-1">Profil va maktab ma&apos;lumotlari</p>
      </div>

      {/* Profil */}
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
              <p className="font-medium">{u?.first_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">Familiya</p>
              <p className="font-medium">{u?.last_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">Telefon</p>
              <p className="font-medium">{u?.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">Holat</p>
              <Badge variant={u?.status === "active" ? "default" : "secondary"}>
                {u?.status === "active" ? "Faol" : u?.status}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-1">Ro&apos;yxatdan o&apos;tgan</p>
              <p className="font-medium">
                {u?.created_at ? new Date(u.created_at).toLocaleDateString("uz-UZ") : "—"}
              </p>
            </div>
          </div>

          <TeacherProfileEditForm
            firstName={u?.first_name ?? ""}
            lastName={u?.last_name ?? ""}
          />
        </CardContent>
      </Card>

      {/* Maktab va sinflar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span aria-hidden="true">🏫</span> Maktab va sinflar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherSchoolForm
            schools={(allSchools ?? []).map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }))}
            subjects={(allSubjects ?? []).map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }))}
            assigned={assignedSchools}
          />
        </CardContent>
      </Card>
    </div>
  );
}
