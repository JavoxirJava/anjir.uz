import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.teacher.analytics} — I-Imkon.uz`,
};

type AnalyticsData = {
  students: number;
  tests: number;
  lectures: number;
  avg_score: number | null;
  attempts_by_day: { day: string; count: number }[];
  score_distribution: { label: string; count: number; pct: number }[];
  total_attempts: number;
};

export default async function TeacherAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await apiGet<AnalyticsData>(`/teachers/${user.id}/analytics`).catch(() => ({
    students: 0,
    tests: 0,
    lectures: 0,
    avg_score: null,
    attempts_by_day: [],
    score_distribution: [],
    total_attempts: 0,
  }));

  const maxCount = Math.max(...data.attempts_by_day.map((d) => d.count), 1);

  const colorMap: Record<string, string> = {
    "A'lo (86–100%)": "bg-green-500",
    "Yaxshi (71–85%)": "bg-blue-500",
    "Qoniqarli (56–70%)": "bg-yellow-500",
    "Qoniqarsiz (0–55%)": "bg-red-500",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.analytics}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "O'quvchilar",   value: data.students,  icon: "👥" },
          { label: "Testlar",       value: data.tests,     icon: "📝" },
          { label: "Ma'ruzalar",    value: data.lectures,  icon: "📚" },
          { label: "O'rtacha ball", value: data.avg_score !== null ? `${data.avg_score}%` : "—", icon: "📊" },
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
            {data.attempts_by_day.map((d) => (
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

      {data.score_distribution.some((g) => g.count > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ball taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2" role="list" aria-label="Ball taqsimoti">
              {data.score_distribution.map((grade) => (
                <div key={grade.label} className="flex items-center gap-3" role="listitem">
                  <div className="text-sm w-40 shrink-0">{grade.label}</div>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorMap[grade.label] ?? "bg-primary"}`}
                      style={{ width: `${grade.pct}%` }}
                      role="progressbar"
                      aria-valuenow={grade.pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${grade.label}: ${grade.pct}%`}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground w-16 text-right">
                    {grade.count} ({grade.pct}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
