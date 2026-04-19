import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.admin.dashboard} — Anjir.uz`,
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: schoolCount },
    { count: directorCount },
    { count: teacherCount },
    { count: studentCount },
    { count: subjectCount },
  ] = await Promise.all([
    supabase.from("schools").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "director"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("subjects").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: uz.admin.schools,    value: schoolCount ?? 0,    href: "/admin/schools",   icon: "🏫" },
    { label: uz.admin.directors,  value: directorCount ?? 0,  href: "/admin/directors", icon: "👔" },
    { label: "O'qituvchilar",    value: teacherCount ?? 0,   href: "/admin/users",     icon: "👨‍🏫" },
    { label: "O'quvchilar",      value: studentCount ?? 0,   href: "/admin/users",     icon: "👨‍🎓" },
    { label: uz.admin.subjects,   value: subjectCount ?? 0,   href: "/admin/subjects",  icon: "📚" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.admin.dashboard}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {stats.map((s) => (
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/schools", label: uz.admin.addSchool },
          { href: "/admin/directors", label: uz.admin.addDirector },
          { href: "/admin/subjects", label: uz.admin.addSubject },
          { href: "/admin/analytics", label: uz.admin.analytics },
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
