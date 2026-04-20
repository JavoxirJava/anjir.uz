import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditSchoolClassForm } from "./EditSchoolClassForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.profile.title} — Anjir.uz`,
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userData } = await supabase
    .from("users")
    .select("first_name, last_name, role, status, created_at")
    .eq("id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("class_id, classes(grade, letter, school_id, schools(id, name))")
    .eq("user_id", user.id)
    .single();

  // Barcha maktablar — admin client (RLS bypass)
  const admin = createAdminClient();
  const { data: schools } = await admin
    .from("schools")
    .select("id, name")
    .order("name");

  // Test natijalari
  const { data: attempts } = await supabase
    .from("test_attempts")
    .select("score, finished_at")
    .eq("student_id", user.id)
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false })
    .limit(10);

  const validAttempts = (attempts ?? []).filter((a: { score: number | null }) => a.score !== null);
  const avgScore = validAttempts.length > 0
    ? Math.round(validAttempts.reduce((s: number, a: { score: number | null }) => s + (a.score ?? 0), 0) / validAttempts.length)
    : null;

  const classInfo = profile
    ? (Array.isArray((profile as any).classes) ? (profile as any).classes[0] : (profile as any).classes)
    : null;

  const schoolInfo = classInfo
    ? (Array.isArray(classInfo.schools) ? classInfo.schools[0] : classInfo.schools)
    : null;

  const currentClassId = (profile as any)?.class_id ?? null;
  const currentSchoolId = schoolInfo?.id ?? null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{uz.profile.title}</h1>

      {/* Shaxsiy ma'lumotlar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{uz.profile.personalInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary" aria-hidden="true">
              {userData?.first_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-lg font-semibold">
                {userData?.first_name} {userData?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date((userData as any)?.created_at ?? "").toLocaleDateString("uz-UZ", { month: "long", year: "numeric" })} dan beri a&apos;zo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Sinf</p>
              <p className="font-medium">
                {classInfo ? `${classInfo.grade}-sinf ${classInfo.letter}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Maktab</p>
              <p className="font-medium">{schoolInfo?.name ?? "—"}</p>
            </div>
          </div>

          {!currentClassId && (
            <p className="text-sm text-orange-600 font-medium mt-2">
              ⚠️ Sinf tanlanmagan — quyida tanlang
            </p>
          )}

          <EditSchoolClassForm
            schools={(schools ?? []).map((s: { id: string; name: string }) => ({ id: s.id, name: s.name }))}
            currentClassId={currentClassId}
            currentSchoolId={currentSchoolId}
          />
        </CardContent>
      </Card>

      {/* Statistika */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mening natijalarim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{validAttempts.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Yechilgan testlar</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">
                {avgScore !== null ? `${avgScore}%` : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">O&apos;rtacha ball</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* So'nggi natijalar */}
      {validAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">So&apos;nggi test natijalari</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" role="list">
              {validAttempts.slice(0, 5).map((a: { score: number | null; finished_at: string | null }, i: number) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {a.finished_at
                      ? new Date(a.finished_at).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" })
                      : "—"}
                  </span>
                  <Badge variant={
                    (a.score ?? 0) >= 86 ? "default"
                      : (a.score ?? 0) >= 56 ? "secondary"
                        : "destructive"
                  }>
                    {Math.round(a.score ?? 0)}%
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
