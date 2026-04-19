import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.director.analytics} — Anjir.uz`,
};

export default async function DirectorAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: school } = await supabase
    .from("schools")
    .select("id, name")
    .eq("director_id", user!.id)
    .single();

  const schoolId = (school as { id: string } | null)?.id;

  if (!schoolId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{uz.director.analytics}</h1>
        <p className="text-muted-foreground">Maktab topilmadi.</p>
      </div>
    );
  }

  // Barcha test urinishlari (maktab o'quvchilari)
  const { data: allAttempts } = await supabase
    .from("test_attempts")
    .select("score, student_id, finished_at")
    .not("finished_at", "is", null)
    .limit(2000);

  const validAttempts = (allAttempts ?? []).filter((a: { score: number | null }) => a.score !== null);
  const avgScore = validAttempts.length > 0
    ? Math.round(validAttempts.reduce((s: number, a: { score: number | null }) => s + (a.score ?? 0), 0) / validAttempts.length)
    : null;

  // Sinflar bo'yicha statistika
  const { data: classes } = await supabase
    .from("classes")
    .select("id, grade, letter")
    .eq("school_id", schoolId)
    .order("grade");

  // O'quvchilar soni
  const { count: totalStudents } = await supabase
    .from("student_profiles")
    .select("*", { count: "exact", head: true });

  // Aktiv o'quvchilar
  const { count: activeStudents } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .eq("status", "active");

  const { count: pendingStudents } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")
    .eq("status", "pending");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.director.analytics}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Jami o'quvchilar", value: totalStudents ?? 0, icon: "👥" },
          { label: "Aktiv", value: activeStudents ?? 0, icon: "✅" },
          { label: "Kutilmoqda", value: pendingStudents ?? 0, icon: "⏳" },
          { label: "O'rtacha ball", value: avgScore !== null ? `${avgScore}%` : "—", icon: "📊" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="text-2xl mb-1" aria-hidden="true">{s.icon}</div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sinflar ro'yxati */}
      {(classes ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sinflar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(classes ?? []).map((cls: { id: string; grade: number; letter: string }) => (
                <div
                  key={cls.id}
                  className="rounded-lg border px-4 py-2 text-sm text-center"
                >
                  {cls.grade}{cls.letter}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ball taqsimoti */}
      {validAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maktab bo&apos;yicha ball taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "A'lo (86–100%)", min: 86, max: 100, color: "bg-green-500" },
                { label: "Yaxshi (71–85%)", min: 71, max: 85, color: "bg-blue-500" },
                { label: "Qoniqarli (56–70%)", min: 56, max: 70, color: "bg-yellow-500" },
                { label: "Qoniqarsiz (0–55%)", min: 0, max: 55, color: "bg-red-500" },
              ].map((grade) => {
                const count = validAttempts.filter(
                  (a: { score: number | null }) => (a.score ?? 0) >= grade.min && (a.score ?? 0) <= grade.max
                ).length;
                const pct = Math.round((count / validAttempts.length) * 100);
                return (
                  <div key={grade.label} className="flex items-center gap-3">
                    <div className="text-sm w-40 shrink-0">{grade.label}</div>
                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${grade.color}`}
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground w-16 text-right">
                      {count} ({pct}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
