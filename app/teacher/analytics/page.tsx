import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.teacher.analytics} — I-Imkon.uz`,
};

export default async function TeacherAnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // O'quvchilar soni (teacher assignments orqali)
  const { data: assignments } = await supabase
    .from("teacher_assignments")
    .select("class_id")
    .eq("teacher_id", user!.id);

  const classIds = [...new Set((assignments ?? []).map((a: { class_id: string }) => a.class_id))];

  const { count: studentCount } = await supabase
    .from("student_profiles")
    .select("*", { count: "exact", head: true })
    .in("class_id", classIds.length > 0 ? classIds : ["__none__"]);

  // Testlar soni
  const { count: testCount } = await supabase
    .from("tests")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", user!.id);

  // Test urinishlari (tugallangan)
  const { data: attempts } = await supabase
    .from("test_attempts")
    .select("score, finished_at")
    .eq("teacher_id", user!.id)
    .not("finished_at", "is", null)
    .limit(1000);

  // Lectures soni
  const { count: lectureCount } = await supabase
    .from("lectures")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", user!.id);

  // O'rtacha ball
  const validAttempts = (attempts ?? []).filter((a: { score: number | null }) => a.score !== null);
  const avgScore = validAttempts.length > 0
    ? Math.round(validAttempts.reduce((sum: number, a: { score: number | null }) => sum + (a.score ?? 0), 0) / validAttempts.length)
    : null;

  // So'nggi 7 kun testlar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const attemptsByDay = last7Days.map((day) => ({
    day: day.slice(5), // MM-DD
    count: (attempts ?? []).filter((a: { finished_at: string | null }) =>
      a.finished_at?.startsWith(day)
    ).length,
  }));

  const maxCount = Math.max(...attemptsByDay.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.analytics}</h1>

      {/* Umumiy statistikalar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "O'quvchilar", value: studentCount ?? 0, icon: "👥" },
          { label: "Testlar",     value: testCount ?? 0,    icon: "📝" },
          { label: "Ma'ruzalar",  value: lectureCount ?? 0, icon: "📚" },
          { label: "O'rtacha ball", value: avgScore !== null ? `${avgScore}%` : "—", icon: "📊" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <div className="text-2xl mb-1" aria-hidden="true">{stat.icon}</div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* So'nggi 7 kun faoliyati */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">So&apos;nggi 7 kun — test urinishlari</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-end gap-2 h-32"
            role="img"
            aria-label="So'nggi 7 kun test urinishlari grafigi"
          >
            {attemptsByDay.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-mono text-muted-foreground">{d.count || ""}</div>
                <div
                  className="w-full bg-primary rounded-t-sm transition-all"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                  aria-label={`${d.day}: ${d.count} ta urinish`}
                />
                <div className="text-xs text-muted-foreground">{d.day}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ball taqsimoti */}
      {validAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ball taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2" role="list" aria-label="Ball taqsimoti">
              {[
                { label: "A'lo (86–100%)", min: 86, max: 100, color: "bg-green-500" },
                { label: "Yaxshi (71–85%)", min: 71, max: 85, color: "bg-blue-500" },
                { label: "Qoniqarli (56–70%)", min: 56, max: 70, color: "bg-yellow-500" },
                { label: "Qoniqarsiz (0–55%)", min: 0,  max: 55, color: "bg-red-500" },
              ].map((grade) => {
                const count = validAttempts.filter(
                  (a: { score: number | null }) => (a.score ?? 0) >= grade.min && (a.score ?? 0) <= grade.max
                ).length;
                const pct = Math.round((count / validAttempts.length) * 100);
                return (
                  <div key={grade.label} className="flex items-center gap-3" role="listitem">
                    <div className="text-sm w-40 shrink-0">{grade.label}</div>
                    <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${grade.color}`}
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${grade.label}: ${pct}%`}
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
