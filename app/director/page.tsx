import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.director.dashboard} — Anjir.uz`,
};

export default async function DirectorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Direktor maktabi
  const { data: school } = await supabase
    .from("schools")
    .select("id, name, address")
    .eq("director_id", user!.id)
    .single();

  const schoolId = (school as { id: string } | null)?.id;

  const [
    { count: teacherCount },
    { count: studentCount },
    { count: classCount },
    { count: lectureCount },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "teacher").eq("school_id" as never, schoolId ?? ""),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student").eq("school_id" as never, schoolId ?? ""),
    supabase.from("classes").select("*", { count: "exact", head: true }).eq("school_id", schoolId ?? ""),
    supabase.from("lectures").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{uz.director.dashboard}</h1>
        {school && (
          <p className="text-muted-foreground">
            {(school as { name: string }).name}
            {(school as { address: string | null }).address && ` — ${(school as { address: string | null }).address}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: uz.director.teachers, value: teacherCount ?? 0, href: "/director/teachers", icon: "👨‍🏫" },
          { label: uz.director.students, value: studentCount ?? 0, href: "/director/students", icon: "👨‍🎓" },
          { label: uz.director.classes,  value: classCount ?? 0,   href: "/director/classes",  icon: "🏫" },
          { label: uz.director.lectures, value: lectureCount ?? 0,  href: "/director/lectures", icon: "📚" },
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
