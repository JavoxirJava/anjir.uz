import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.teacher.dashboard} — Anjir.uz`,
};

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Statistika
  const [{ count: lectureCount }, { count: testCount }, { count: pendingCount }] =
    await Promise.all([
      supabase.from("lectures").select("id", { count: "exact", head: true }).eq("creator_id", user!.id),
      supabase.from("tests").select("id", { count: "exact", head: true }).eq("teacher_id", user!.id),
      supabase
        .from("student_profiles")
        .select("user_id", { count: "exact", head: true })
        .in(
          "class_id",
          (
            await supabase
              .from("teacher_assignments")
              .select("class_id")
              .eq("teacher_id", user!.id)
          ).data?.map((r: { class_id: string }) => r.class_id) ?? []
        )
        .is("approved_at", null),
    ]);

  const stats = [
    { label: uz.teacher.myLectures, value: lectureCount ?? 0, href: "/teacher/lectures" },
    { label: uz.teacher.myTests, value: testCount ?? 0, href: "/teacher/tests" },
    { label: uz.teacher.pendingStudents, value: pendingCount ?? 0, href: "/teacher/students" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.teacher.dashboard}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" aria-label={`${s.label}: ${s.value}`}>
                  {s.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/teacher/lectures/new", label: uz.teacher.addLecture },
          { href: "/teacher/tests/new", label: uz.teacher.addTest },
          { href: "/teacher/games/new", label: uz.teacher.addGame },
          { href: "/teacher/assignments", label: uz.teacher.addAssignment },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center justify-center rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring text-center"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
