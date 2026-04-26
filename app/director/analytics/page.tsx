import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.director.analytics} — I-Imkon.uz`,
};

type AnalyticsData = {
  school: { id: string; name: string };
  total_students: number;
  active_students: number;
  pending_students: number;
  avg_score: number | null;
  classes: { id: string; grade: number; letter: string }[];
  score_distribution: { label: string; min: number; max: number; count: number; pct: number }[];
};

export default async function DirectorAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await apiGet<AnalyticsData | null>("/schools/my-analytics").catch(() => null);

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{uz.director.analytics}</h1>
        <p className="text-muted-foreground">Maktab topilmadi.</p>
      </div>
    );
  }

  const colorMap: Record<string, string> = {
    "A'lo (86–100%)": "bg-green-500",
    "Yaxshi (71–85%)": "bg-blue-500",
    "Qoniqarli (56–70%)": "bg-yellow-500",
    "Qoniqarsiz (0–55%)": "bg-red-500",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.director.analytics}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Jami o'quvchilar", value: data.total_students, icon: "👥" },
          { label: "Aktiv",            value: data.active_students, icon: "✅" },
          { label: "Kutilmoqda",       value: data.pending_students, icon: "⏳" },
          { label: "O'rtacha ball",    value: data.avg_score !== null ? `${data.avg_score}%` : "—", icon: "📊" },
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

      {data.classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sinflar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.classes.map((cls) => (
                <div key={cls.id} className="rounded-lg border px-4 py-2 text-sm text-center">
                  {cls.grade}{cls.letter}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.score_distribution.some((g) => g.count > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maktab bo&apos;yicha ball taqsimoti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.score_distribution.map((grade) => (
                <div key={grade.label} className="flex items-center gap-3">
                  <div className="text-sm w-40 shrink-0">{grade.label}</div>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorMap[grade.label] ?? "bg-primary"}`}
                      style={{ width: `${grade.pct}%` }}
                      role="progressbar"
                      aria-valuenow={grade.pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
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
