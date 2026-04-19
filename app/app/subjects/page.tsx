import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uz } from "@/lib/strings/uz";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: `${uz.student.subjects} — Anjir.uz`,
};

export default async function StudentSubjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("class_id")
    .eq("user_id", user.id)
    .single();

  const classId = (profile as { class_id: string } | null)?.class_id;

  // Bu sinfga biriktirilgan fanlarni ma'ruzalar va testlar orqali aniqlaymiz
  const [{ data: lecSubjects }, { data: testSubjects }] = await Promise.all([
    classId
      ? supabase
          .from("lectures")
          .select("subject_id, subjects(id, name)")
          .eq("class_id", classId)
          .not("subject_id", "is", null)
      : Promise.resolve({ data: [] }),
    classId
      ? supabase
          .from("tests")
          .select("subject_id, subjects(id, name), test_classes!inner(class_id)")
          .eq("test_classes.class_id", classId)
          .not("subject_id", "is", null)
      : Promise.resolve({ data: [] }),
  ]);

  // Unique subjects
  const subjectMap = new Map<string, { id: string; name: string; lectureCount: number; testCount: number }>();

  (lecSubjects ?? []).forEach((row: unknown) => {
    const r = row as { subject_id: string; subjects: { id: string; name: string } | null };
    if (r.subjects) {
      const existing = subjectMap.get(r.subjects.id);
      if (existing) {
        existing.lectureCount++;
      } else {
        subjectMap.set(r.subjects.id, { id: r.subjects.id, name: r.subjects.name, lectureCount: 1, testCount: 0 });
      }
    }
  });

  (testSubjects ?? []).forEach((row: unknown) => {
    const r = row as { subject_id: string; subjects: { id: string; name: string } | null };
    if (r.subjects) {
      const existing = subjectMap.get(r.subjects.id);
      if (existing) {
        existing.testCount++;
      } else {
        subjectMap.set(r.subjects.id, { id: r.subjects.id, name: r.subjects.name, lectureCount: 0, testCount: 1 });
      }
    }
  });

  const subjects = Array.from(subjectMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Agar fanlar topilmasa — global fanlarni ko'rsatamiz
  const { data: globalSubjects } = subjects.length === 0
    ? await supabase.from("subjects").select("id, name").order("name")
    : { data: [] };

  const displaySubjects = subjects.length > 0
    ? subjects
    : (globalSubjects ?? []).map((s: { id: string; name: string }) => ({
        ...s,
        lectureCount: 0,
        testCount: 0,
      }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{uz.student.subjects}</h1>

      {displaySubjects.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">{uz.common.noData}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4" role="list" aria-label={uz.student.subjects}>
          {displaySubjects.map((s) => (
            <li key={s.id}>
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-5 pb-5 flex flex-col gap-3">
                  <h2 className="font-semibold text-base">{s.name}</h2>
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    {s.lectureCount > 0 && (
                      <p>📄 {s.lectureCount} ta ma&apos;ruza</p>
                    )}
                    {s.testCount > 0 && (
                      <p>📝 {s.testCount} ta test</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <Link
                      href={`/app/lectures?subject=${s.id}`}
                      className="text-xs text-primary underline underline-offset-2 focus-visible:outline-2"
                    >
                      Ma&apos;ruzalar →
                    </Link>
                    <Link
                      href={`/app/tests?subject=${s.id}`}
                      className="text-xs text-primary underline underline-offset-2 focus-visible:outline-2"
                    >
                      Testlar →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
