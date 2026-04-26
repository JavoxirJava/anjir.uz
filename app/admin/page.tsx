import { getCurrentUser } from "@/lib/api/auth";
import { apiGet } from "@/lib/api/server";
import type { Metadata } from "next";
import Link from "next/link";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.admin.dashboard} — I-Imkon.uz`,
};

interface AdminStats {
  schools: number;
  directors: number;
  teachers: number;
  students: number;
  subjects: number;
}

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const stats = await apiGet<AdminStats>("/schools/admin-stats").catch(
    () => ({ schools: 0, directors: 0, teachers: 0, students: 0, subjects: 0 })
  );

  const statCards = [
    { label: uz.admin.schools,   value: stats.schools,   href: "/admin/schools",   icon: "🏫" },
    { label: uz.admin.directors, value: stats.directors, href: "/admin/directors", icon: "👔" },
    { label: "O'qituvchilar",   value: stats.teachers,  href: "/admin/users",     icon: "👨‍🏫" },
    { label: "O'quvchilar",     value: stats.students,  href: "/admin/users",     icon: "👨‍🎓" },
    { label: uz.admin.subjects,  value: stats.subjects,  href: "/admin/subjects",  icon: "📚" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.admin.dashboard}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Link key={`${s.href}-${s.label}`} href={s.href} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-xl">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  <span aria-hidden="true">{s.icon}</span> {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { href: "/admin/schools",   label: uz.admin.addSchool,   icon: "🏫" },
          { href: "/admin/directors", label: uz.admin.addDirector, icon: "👔" },
          { href: "/admin/subjects",  label: uz.admin.addSubject,  icon: "📖" },
          { href: "/admin/analytics", label: uz.admin.analytics,   icon: "📊" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium hover:bg-muted focus-visible:outline-2 transition-colors"
          >
            <span aria-hidden="true">{a.icon}</span>
            <span className="truncate">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
