import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import Link from "next/link";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.director.dashboard} — I-Imkon.uz`,
};

interface DirectorStats {
  school: { id: string; name: string; address: string | null } | null;
  teachers: number;
  students: number;
  classes: number;
  lectures: number;
}

export default async function DirectorDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const stats = await apiGet<DirectorStats>("/schools/my-stats").catch(
    () => ({ school: null, teachers: 0, students: 0, classes: 0, lectures: 0 })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{uz.director.dashboard}</h1>
        {stats.school && (
          <p className="text-muted-foreground">
            {stats.school.name}
            {stats.school.address && ` — ${stats.school.address}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: uz.director.teachers, value: stats.teachers, href: "/director/teachers", icon: "👨‍🏫" },
          { label: uz.director.students, value: stats.students, href: "/director/students", icon: "👨‍🎓" },
          { label: uz.director.classes,  value: stats.classes,  href: "/director/classes",  icon: "🏫" },
          { label: uz.director.lectures, value: stats.lectures, href: "/director/lectures", icon: "📚" },
        ].map((s) => (
          <Link key={s.href} href={s.href} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <span aria-hidden="true">{s.icon}</span> {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: "/director/teachers", label: "O'qituvchilar" },
          { href: "/director/classes", label: "Sinflar" },
          { href: "/director/analytics", label: uz.director.analytics },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 transition-colors text-center"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
