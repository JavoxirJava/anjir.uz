import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditSchoolClassForm } from "./EditSchoolClassForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${uz.profile.title} — I-Imkon.uz`,
};

interface StudentProfile {
  class_id: string | null;
  school_id: string | null;
  grade: number | null;
  letter: string | null;
  school_name: string | null;
}

interface Attempt {
  score: number | null;
  finished_at: string | null;
}

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, resultsData, schools] = await Promise.all([
    apiGet<StudentProfile>("/students/me").catch(() => null),
    apiGet<{ tests: Attempt[] }>("/students/me/results").catch(() => ({ tests: [] })),
    apiGet<{ id: string; name: string }[]>("/schools").catch(() => []),
  ]);

  const validAttempts = (resultsData.tests ?? []).filter((a) => a.score !== null).slice(0, 10);
  const avgScore = validAttempts.length > 0
    ? Math.round(validAttempts.reduce((s, a) => s + (a.score ?? 0), 0) / validAttempts.length)
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{uz.profile.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{uz.profile.personalInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary" aria-hidden="true">
              {user.first_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <p className="text-lg font-semibold">{user.first_name} {user.last_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Sinf</p>
              <p className="font-medium">
                {profile?.grade && profile?.letter ? `${profile.grade}-sinf ${profile.letter}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Maktab</p>
              <p className="font-medium">{profile?.school_name ?? "—"}</p>
            </div>
          </div>

          {!profile?.class_id && (
            <p className="text-sm text-orange-600 font-medium mt-2">
              ⚠️ Sinf tanlanmagan — quyida tanlang
            </p>
          )}

          <EditSchoolClassForm
            schools={schools}
            currentClassId={profile?.class_id ?? null}
            currentSchoolId={profile?.school_id ?? null}
          />
        </CardContent>
      </Card>

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

      {validAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">So&apos;nggi test natijalari</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" role="list">
              {validAttempts.slice(0, 5).map((a, i) => (
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
