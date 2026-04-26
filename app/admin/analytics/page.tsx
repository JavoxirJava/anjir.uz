import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.admin.analytics} — I-Imkon.uz`,
};

interface AnalyticsData {
  schools: number;
  teachers: number;
  students: number;
  lectures: number;
  tests: number;
  attempt_count: number;
  avg_score: number | null;
}

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await apiGet<AnalyticsData>("/schools/admin-analytics").catch(
    () => ({ schools: 0, teachers: 0, students: 0, lectures: 0, tests: 0, attempt_count: 0, avg_score: null })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.admin.analytics}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Maktablar",      value: data.schools,   icon: "🏫" },
          { label: "O'qituvchilar",  value: data.teachers,  icon: "👨‍🏫" },
          { label: "O'quvchilar",    value: data.students,  icon: "👨‍🎓" },
          { label: "Ma'ruzalar",     value: data.lectures,  icon: "📚" },
          { label: "Testlar",        value: data.tests,     icon: "📝" },
          { label: "O'rtacha ball",  value: data.avg_score !== null ? `${data.avg_score}%` : "—", icon: "📊" },
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
    </div>
  );
}
