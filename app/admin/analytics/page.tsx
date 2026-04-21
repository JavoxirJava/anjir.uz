import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.admin.analytics} — I-Imkon.uz`,
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [
    { count: schoolCount },
    { count: teacherCount },
    { count: studentCount },
    { count: lectureCount },
    { count: testCount },
    { count: attemptCount },
  ] = await Promise.all([
    supabase.from("schools").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("lectures").select("*", { count: "exact", head: true }),
    supabase.from("tests").select("*", { count: "exact", head: true }),
    supabase.from("test_attempts").select("*", { count: "exact", head: true }).not("finished_at", "is", null),
  ]);

  const { data: allAttempts } = await supabase
    .from("test_attempts")
    .select("score")
    .not("finished_at", "is", null)
    .not("score", "is", null)
    .limit(10000);

  const valid = (allAttempts ?? []).filter((a: { score: number | null }) => a.score !== null);
  const avgScore = valid.length > 0
    ? Math.round(valid.reduce((s: number, a: { score: number | null }) => s + (a.score ?? 0), 0) / valid.length)
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.admin.analytics}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Maktablar", value: schoolCount ?? 0, icon: "🏫" },
          { label: "O'qituvchilar", value: teacherCount ?? 0, icon: "👨‍🏫" },
          { label: "O'quvchilar", value: studentCount ?? 0, icon: "👨‍🎓" },
          { label: "Ma'ruzalar", value: lectureCount ?? 0, icon: "📚" },
          { label: "Testlar", value: testCount ?? 0, icon: "📝" },
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

      {valid.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tizim bo&apos;yicha ball taqsimoti ({attemptCount} ta urinish)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "A'lo (86–100%)", min: 86, max: 100, color: "bg-green-500" },
                { label: "Yaxshi (71–85%)", min: 71, max: 85, color: "bg-blue-500" },
                { label: "Qoniqarli (56–70%)", min: 56, max: 70, color: "bg-yellow-500" },
                { label: "Qoniqarsiz (0–55%)", min: 0, max: 55, color: "bg-red-500" },
              ].map((grade) => {
                const count = valid.filter(
                  (a: { score: number | null }) => (a.score ?? 0) >= grade.min && (a.score ?? 0) <= grade.max
                ).length;
                const pct = Math.round((count / valid.length) * 100);
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
