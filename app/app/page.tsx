import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: `${uz.student.dashboard} — Anjir.uz`,
};

const TYPE_LABELS: Record<string, string> = {
  pdf: "PDF", video: "Video", audio: "Audio", ppt: "PPT",
};

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // O'quvchi profili
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("class_id, school_id")
    .eq("user_id", user!.id)
    .single();

  // So'nggi ma'ruzalar
  const { data: lecturesRaw } = await supabase
    .from("lectures")
    .select("id, title, content_type, subjects(name)")
    .eq("class_id", profile?.class_id ?? "")
    .order("created_at", { ascending: false })
    .limit(5);

  type LectureItem = {
    id: string;
    title: string;
    content_type: string;
    subjects?: { name: string } | { name: string }[] | null;
  };
  const lectures = (lecturesRaw ?? []) as unknown as LectureItem[];

  // Testlar
  const { data: testClassesData } = await supabase
    .from("test_classes")
    .select("test_id")
    .eq("class_id", profile?.class_id ?? "");

  const testIds = (testClassesData ?? []).map((r: { test_id: string }) => r.test_id);

  const { data: testsRaw } = testIds.length
    ? await supabase
        .from("tests")
        .select("id, title, test_type, time_limit")
        .in("id", testIds)
        .limit(5)
    : { data: [] };

  const tests = (testsRaw ?? []) as {
    id: string;
    title: string;
    test_type: string;
    time_limit: number | null;
  }[];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{uz.student.dashboard}</h1>

      {/* So'nggi ma'ruzalar */}
      <section aria-labelledby="lectures-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="lectures-heading" className="text-lg font-semibold">
            {uz.student.lectures}
          </h2>
        </div>

        {!lectures?.length ? (
          <p className="text-muted-foreground text-sm">{uz.common.noData}</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
            {lectures.map((l) => (
              <li key={l.id}>
                <Link href={`/app/lectures/${l.id}`}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {TYPE_LABELS[l.content_type]}
                        </Badge>
                        {l.subjects && (
                          <span className="text-xs text-muted-foreground">
                            {Array.isArray(l.subjects) ? l.subjects[0]?.name : l.subjects?.name}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-base font-medium leading-snug">
                        {l.title}
                      </CardTitle>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Testlar */}
      <section aria-labelledby="tests-heading">
        <h2 id="tests-heading" className="text-lg font-semibold mb-4">
          {uz.student.tests}
        </h2>

        {!tests?.length ? (
          <p className="text-muted-foreground text-sm">{uz.common.noData}</p>
        ) : (
          <ul className="space-y-2" role="list">
            {tests.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/app/tests/${t.id}`}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="font-medium">{t.title}</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {t.time_limit && <span>{t.time_limit} daq</span>}
                    <span aria-hidden="true">→</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
